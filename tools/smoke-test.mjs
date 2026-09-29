// tools/smoke-test.mjs
// Arranca el preview de Vite y verifica que sirve el build correctamente.
import { preview } from 'vite'

const server = await preview({ preview: { port: 4173, strictPort: true } })
await new Promise((r) => setTimeout(r, 900))

const base = 'http://localhost:4173'

async function get(path) {
  const res = await fetch(base + path)
  return { status: res.status, type: res.headers.get('content-type') ?? '', body: await res.text() }
}

const index = await get('/')
console.log('GET / ->', index.status, index.type)

const jsMatch = index.body.match(/\/assets\/[^"']+\.js/)
const cssMatch = index.body.match(/\/assets\/[^"']+\.css/)
const webpMatch = index.body.match(/\/assets\/[^"']+\.webp/)
console.log('js :', jsMatch?.[0] ?? 'NO ENCONTRADO')
console.log('css:', cssMatch?.[0] ?? 'NO ENCONTRADO')

let ok = true

if (jsMatch) {
  const js = await get(jsMatch[0])
  console.log('  js  asset ->', js.status, js.type)
  if (js.status !== 200) ok = false
}
if (cssMatch) {
  const css = await get(cssMatch[0])
  console.log('  css asset ->', css.status, css.type)
  if (css.status !== 200) ok = false
}
// los webp se referencian desde el CSS/JS, no desde el HTML; verificamos que existan en dist
if (webpMatch) {
  const w = await get(webpMatch[0])
  console.log('  webp     ->', w.status, w.type)
}

// PWA: manifest, service worker e iconos
const manifestRes = await get('/manifest.webmanifest')
console.log('GET /manifest.webmanifest ->', manifestRes.status, manifestRes.type)
if (manifestRes.status !== 200) ok = false
try {
  const manifest = JSON.parse(manifestRes.body)
  if (!manifest.name || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    console.log('  manifest -> name/icons inválidos')
    ok = false
  } else {
    for (const icon of manifest.icons) {
      const ir = await get(icon.src)
      console.log('  icon', icon.src, '->', ir.status, ir.type)
      if (ir.status !== 200) ok = false
    }
  }
} catch {
  console.log('  manifest -> JSON inválido')
  ok = false
}
const swRes = await get('/sw.js')
console.log('GET /sw.js ->', swRes.status, swRes.type)
if (swRes.status !== 200) ok = false

const swDevRes = await get('/sw-dev.js')
console.log('GET /sw-dev.js ->', swDevRes.status, swDevRes.type)
if (swDevRes.status !== 200) ok = false

await server.close()
console.log(ok ? 'SMOKE TEST: OK' : 'SMOKE TEST: FALLO')
process.exit(ok ? 0 : 1)
