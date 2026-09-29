/** Activa las herramientas de depuración PWA: en `vite dev` siempre, o en
 *  cualquier build con `?pwa=debug` en la URL. */
export function isPwaDebug(): boolean {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  const v = new URLSearchParams(window.location.search).get('pwa')
  if (v === null) return false
  return v !== '0' && v !== 'false'
}

export interface ClearAppDataResult {
  registrations: number
  caches: number
  storageKeys: number
}

/** Borra todo lo que puede bloquear la instalación desde JavaScript:
 *  - Service workers registrados (desregistra y deja de controlar la página).
 *  - Cache Storage (todas las cachés del origen).
 *  - localStorage / sessionStorage (bandera `lpf-pwa-installed`, sesión, etc.).
 *
 *  Nota: no borra el *cooldown* interno de Chrome tras descartar un prompt
 *  nativo; eso vive en Ajustes del sitio y solo se resetea desde el navegador
 *  o con `#bypass-app-banner-engagement-checks`. */
export async function clearAppData(): Promise<ClearAppDataResult> {
  const result: ClearAppDataResult = { registrations: 0, caches: 0, storageKeys: 0 }

  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      result.registrations = regs.length
      await Promise.all(regs.map((r) => r.unregister()))
    } catch {
      // sin service worker accesible
    }
  }

  if (typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys()
      result.caches = keys.length
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch {
      // sin Cache Storage
    }
  }

  try {
    result.storageKeys = localStorage.length
    localStorage.clear()
    sessionStorage.clear()
  } catch {
    // almacenamiento no disponible
  }

  return result
}
