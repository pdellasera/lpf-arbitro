const PROD_SW = '/sw.js'
const DEV_SW = '/sw-dev.js'

/**
 * Registra el service worker:
 * - Producción: `/sw.js` (network-first para navegación, cache-first para assets).
 * - Desarrollo: `/sw-dev.js` (passthrough, sin caché), para que Chromium considere
 *   la app instalable en `localhost` durante la iteración sin romper HMR.
 * - `VITE_PWA_NO_DEV_SW=1` restaura el comportamiento anterior: en desarrollo
 *   desregistra todo y limpia cachés (sin SW de ningún tipo).
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  if (!import.meta.env.PROD && import.meta.env.VITE_PWA_NO_DEV_SW === '1') {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(() =>
        typeof caches !== 'undefined'
          ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          : undefined,
      )
      .catch(() => undefined)
    return
  }

  const scriptUrl = import.meta.env.PROD ? PROD_SW : DEV_SW

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(scriptUrl)
      .then((reg) => {
        if (import.meta.env.PROD) reg.update().catch(() => undefined)
      })
      .catch((err) => {
        console.error('SW registration failed:', err)
      })
  })
}
