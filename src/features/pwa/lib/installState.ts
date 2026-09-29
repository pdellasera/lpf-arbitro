import type { InstallPlatform } from '../types'

const KEY = 'lpf-pwa-installed'

/** ¿Se está ejecutando ya como app instalada (standalone)? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const mql = (mode: string) => window.matchMedia(`(display-mode: ${mode})`).matches
  if (mql('standalone') || mql('fullscreen') || mql('minimal-ui')) return true
  // iOS Safari (legacy) al abrir desde pantalla de inicio.
  const nav = navigator as Navigator & { standalone?: boolean }
  if (typeof nav.standalone === 'boolean' && nav.standalone) return true
  // Android WebView / TWA lanzada desde el icono.
  if (document.referrer.startsWith('android-app://')) return true
  return false
}

/** Plataforma aproximada (para decidir qué instrucciones de instalación mostrar). */
export function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent
  // iPadOS 13+ se presenta como macOS: multi-touch + plataforma Mac => iOS.
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

export function readInstalled(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markInstalled(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Sin almacenamiento: la detección en vivo (display-mode) cubre el caso.
  }
}
