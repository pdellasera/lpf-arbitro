/* Service Worker de la app LPF (sin dependencias).
 * - Navegación: network-first con fallback al shell cacheado (offline).
 * - Assets estáticos y fuentes de Google: cache-first + revalidate.
 * - Datos del árbitro (/api/* o backend remoto): nunca se cachean.
 */
const CACHE_NAME = 'lpf-shell-v1'
const SHELL = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isSameOrigin = url.origin === self.location.origin
  const isFont = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//.test(url.href)

  // Informe del árbitro: siempre en red, nunca en caché.
  if (isSameOrigin && url.pathname.startsWith('/api/')) return

  // Recursos a gestionar: app shell y assets del propio origen, más fuentes de Google.
  if (!isSameOrigin && !isFont) return

  // Navegación (SPA): red primero, fallback al shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy))
          return res
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  // Estáticos (assets, manifest, fuentes): cache-first + revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
