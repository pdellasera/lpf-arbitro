import { useCallback, useEffect, useState } from 'react'
import type {
  BeforeInstallPromptEvent,
  InstallOutcome,
  InstallPlatform,
  UnavailableReason,
} from '../types'
import { detectPlatform, isStandalone, markInstalled, readInstalled } from '../lib/installState'

// Captura a nivel módulo: `beforeinstallprompt` puede llegar antes del montaje de React.
let deferredPrompt: BeforeInstallPromptEvent | null = null
let deferredPromptAt: number | null = null

function capturePrompt(e: Event) {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  deferredPromptAt = Date.now()
  console.info('[pwa] beforeinstallprompt capturado — instalador nativo disponible')
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', capturePrompt)
}

/** Espera un `beforeinstallprompt` tardío: un gesto del usuario puede provocarlo. */
function waitForPrompt(timeoutMs: number): Promise<'ready' | 'timeout'> {
  return new Promise((resolve) => {
    if (deferredPrompt) {
      resolve('ready')
      return
    }
    let settled = false
    function onPrompt() {
      settle('ready')
    }
    function settle(result: 'ready' | 'timeout') {
      if (settled) return
      settled = true
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onPrompt)
      resolve(result)
    }
    const timer = setTimeout(() => settle('timeout'), timeoutMs)
    window.addEventListener('beforeinstallprompt', onPrompt)
  })
}

export function usePwaInstall() {
  const [platform] = useState<InstallPlatform>(detectPlatform)
  const [installed, setInstalled] = useState<boolean>(() => isStandalone() || readInstalled())
  const [dismissed, setDismissed] = useState(false)
  const [canPrompt, setCanPrompt] = useState<boolean>(deferredPrompt !== null)
  const [promptSeenAt, setPromptSeenAt] = useState<number | null>(deferredPromptAt)
  // true cuando ya sabemos que el prompt nativo no va a llegar (timeout) o ya se consumió.
  const [promptUnavailable, setPromptUnavailable] = useState(false)
  // true cuando hay un service worker activo controlando la página (requisito de instalabilidad).
  const [swActive, setSwActive] = useState(false)

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      deferredPromptAt = Date.now()
      setCanPrompt(true)
      setPromptSeenAt(deferredPromptAt)
      console.info('[pwa] beforeinstallprompt capturado — instalador nativo disponible')
    }
    function onAppInstalled() {
      markInstalled()
      setInstalled(true)
      setCanPrompt(false)
    }
    const mql = window.matchMedia('(display-mode: standalone)')
    function onDisplayModeChange() {
      if (isStandalone()) {
        markInstalled()
        setInstalled(true)
      }
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    mql.addEventListener('change', onDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      mql.removeEventListener('change', onDisplayModeChange)
    }
  }, [])

  // El SW tarda un instante en activarse; es requisito para que Chromium emita el prompt.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let cancelled = false
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        if (!cancelled && regs.some((r) => r.active)) setSwActive(true)
      })
      .catch(() => undefined)
    navigator.serviceWorker.ready
      .then(() => {
        if (!cancelled) setSwActive(true)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  // Si el prompt es imposible (contexto no seguro o sin API de SW), lo marcamos ya,
  // sin esperar. Si es posible pero no llega en ~4 s, mostramos la vía manual.
  useEffect(() => {
    if (deferredPrompt) return
    const impossible =
      typeof window === 'undefined' || !window.isSecureContext || !('serviceWorker' in navigator)
    if (impossible) {
      const reason = !window.isSecureContext
        ? 'contexto no seguro (https/localhost)'
        : 'navegador sin soporte de service worker'
      console.warn(`[pwa] instalador nativo imposible: ${reason}`)
      setPromptUnavailable(true)
      return
    }
    const t = setTimeout(() => {
      console.warn(
        '[pwa] beforeinstallprompt no llegó en 4000 ms — revisa manifest, SW activo y cooldown/engagement de Chrome',
      )
      setPromptUnavailable(true)
    }, 4000)
    return () => clearTimeout(t)
  }, [])

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferredPrompt) return 'unavailable'
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    deferredPrompt = null
    setCanPrompt(false)
    setPromptUnavailable(true)
    if (choice.outcome === 'accepted') {
      markInstalled()
      setInstalled(true)
    }
    return choice.outcome
  }, [])

  // El botón de Android reintenta: el propio tap puede hacer que Chromium emita el evento.
  const retryPrompt = useCallback(async (): Promise<InstallOutcome> => {
    if (deferredPrompt) return promptInstall()
    if (!window.isSecureContext || !('serviceWorker' in navigator)) return 'unavailable'
    const result = await waitForPrompt(3000)
    return result === 'ready' ? promptInstall() : 'unavailable'
  }, [promptInstall])

  const dismiss = useCallback(() => setDismissed(true), [])

  // Capacidad real del contexto (independiente de que el evento ya haya llegado).
  const promptSupported =
    platform === 'android' &&
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator

  const unavailableReason: UnavailableReason | null =
    platform === 'android' && promptUnavailable && typeof window !== 'undefined'
      ? !window.isSecureContext
        ? 'insecure'
        : 'serviceWorker' in navigator && !swActive
          ? 'no-sw'
          : 'unavailable'
      : null

  return {
    /** Modal de instalación visible: app no instalada y el usuario aún no pulsó "Más tarde". */
    needsReminder: !installed && !dismissed,
    installed,
    canPrompt,
    promptSeenAt,
    promptUnavailable,
    promptSupported,
    unavailableReason,
    platform,
    promptInstall,
    retryPrompt,
    dismiss,
  }
}
