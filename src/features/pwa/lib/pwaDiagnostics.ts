import { useEffect, useState } from 'react'

export interface SwRegistrationInfo {
  scope: string
  scriptURL: string
  state: 'installing' | 'waiting' | 'active' | 'redundant' | 'none'
}

export interface ManifestInfo {
  ok: boolean
  status: number
  name: string | null
  display: string | null
  icons: number
}

export interface PwaDiagnostics {
  enabled: boolean
  origin: string
  href: string
  isSecureContext: boolean
  userAgent: string
  hasSwApi: boolean
  controller: boolean
  registrations: SwRegistrationInfo[]
  manifest: ManifestInfo | null
  displayMode: string
  standalone: boolean
}

/** `?pwa=debug` activa el panel (cualquier valor salvo '0'/'false'). */
export function isDiagnosticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const v = new URLSearchParams(window.location.search).get('pwa')
  if (v === null) return false
  return v !== '0' && v !== 'false'
}

export function usePwaDiagnostics(enabled: boolean): PwaDiagnostics {
  const [registrations, setRegistrations] = useState<SwRegistrationInfo[]>([])
  const [manifest, setManifest] = useState<ManifestInfo | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          if (cancelled) return
          setRegistrations(
            regs.map((r) => ({
              scope: r.scope,
              scriptURL: r.active?.scriptURL ?? r.waiting?.scriptURL ?? r.installing?.scriptURL ?? '',
              state: r.active
                ? 'active'
                : r.waiting
                  ? 'waiting'
                  : r.installing
                    ? 'installing'
                    : 'none',
            })),
          )
        })
        .catch(() => undefined)
    }

    fetch('/manifest.webmanifest')
      .then(async (res) => {
        if (cancelled) return
        const raw = await res.text().catch(() => '')
        try {
          const j = JSON.parse(raw)
          setManifest({
            ok: res.ok,
            status: res.status,
            name: j.name ?? null,
            display: j.display ?? null,
            icons: Array.isArray(j.icons) ? j.icons.length : 0,
          })
        } catch {
          setManifest({ ok: false, status: res.status, name: null, display: null, icons: 0 })
        }
      })
      .catch(() => {
        if (!cancelled) setManifest({ ok: false, status: 0, name: null, display: null, icons: 0 })
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches)

  const displayMode =
    typeof window !== 'undefined'
      ? window.matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : window.matchMedia('(display-mode: fullscreen)').matches
          ? 'fullscreen'
          : window.matchMedia('(display-mode: minimal-ui)').matches
            ? 'minimal-ui'
            : 'browser'
      : ''

  return {
    enabled,
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    href: typeof window !== 'undefined' ? window.location.href : '',
    isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    hasSwApi: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    controller:
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      !!navigator.serviceWorker.controller,
    registrations,
    manifest,
    displayMode,
    standalone,
  }
}
