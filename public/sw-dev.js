/* Service Worker SOLO para desarrollo (`vite dev`).
 * No cachea nada: existe para que Chromium considere la app instalable en
 * localhost durante la iteración, ya que la instalabilidad exige un SW activo
 * con handler `fetch`. El handler es pasivo (sin respondWith) a propósito, así
 * HMR sigue funcionando y nunca se sirven assets obsoletos. */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Handler `fetch` presente (requisito de instalabilidad) pero pasivo: nunca
// llamamos a respondWith, así que todas las peticiones siguen su curso normal.
self.addEventListener('fetch', () => {})
