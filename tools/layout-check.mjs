// tools/layout-check.mjs
// Abre la vista de "Partido en vivo" en Chrome headless a 4 tamaños (móvil/tablet),
// valida la geometría clave (escenario a sangre, relación de aspecto del campo, rail
// flotante sin scroll ni solapamientos) y guarda capturas en tools/shots/.
//
// Uso: node --experimental-websocket tools/layout-check.mjs
// Requiere: Chrome instalado (C:\Program Files\Google\Chrome\Application\chrome.exe).
//
// NOTA: en Chrome headless 143 el bundle de producción arroja un error de React
// ajeno a este cambio ("Cannot read properties of null (reading 'useState')",
// dispara en el montaje de SessionProvider/React Query). En un navegador real la
// app funciona. Si en tu entorno la app llega a montar, este script imprime el
// semáforo de geometría y guarda las capturas en tools/shots/.

import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, preview } from 'vite'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const APP_PORT = 4173
const CDP_PORT = 9222
const BASE = `http://localhost:${APP_PORT}`

const VIEWPORTS = [
  { name: 'phone-640x320', width: 640, height: 320 },
  { name: 'phone-800x360', width: 800, height: 360 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'tablet-1524x820', width: 1524, height: 820 },
]

const EXPECT_AR = 976 / 560 // 1.742857

// ---------------------------------------------------------------------------
// 1. Servidor de preview (o dev con `--dev`, que sirve ESM y evita el error de
//    React del bundle de producción en Chrome headless).
// ---------------------------------------------------------------------------
const USE_DEV = process.argv.includes('--dev')
const server = USE_DEV
  ? await createServer({ server: { port: APP_PORT, strictPort: true } })
  : await preview({ preview: { port: APP_PORT, strictPort: true } })
await new Promise((r) => setTimeout(r, USE_DEV ? 1200 : 900))

// ---------------------------------------------------------------------------
// 2. Chrome headless + CDP
// ---------------------------------------------------------------------------
const userDataDir = mkdtempSync(join(tmpdir(), 'lpf-chrome-'))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1600,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function getJson(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('timeout waiting: ' + url)
}

const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json`)
const page = targets.find((t) => t.type === 'page')
if (!page) throw new Error('no page target')

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let msgId = 0
const pending = new Map()
const pageErrors = []
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  } else if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails
    pageErrors.push('EXC: ' + (d.exception?.description ?? d.text ?? '?'))
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    pageErrors.push('ERR: ' + msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  }
}

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++msgId
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (res.result?.exceptionDetails) {
    throw new Error('eval error: ' + JSON.stringify(res.result.exceptionDetails))
  }
  return res.result?.result?.value
}

async function waitFor(expression, timeoutMs = 6000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await evaluate(expression)) return true
    await new Promise((r) => setTimeout(r, 150))
  }
  return false
}

// ---------------------------------------------------------------------------
// 3. Navegación
// ---------------------------------------------------------------------------
await send('Page.enable')
await send('Runtime.enable')

async function openLiveMatch(width, height) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: width,
    screenHeight: height,
  })
  // Puntero táctil => `pointer: coarse` (mantiene la app visible a ≥1024px).
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })

  await send('Page.navigate', { url: BASE + '/' })
  // Espera al documento real (no al about:blank inicial) antes de tocar localStorage.
  const loaded = await waitFor(
    `location.href.startsWith('${BASE}') && document.readyState === 'complete'`,
    USE_DEV ? 30000 : 6000,
  )
  if (!loaded) throw new Error('no cargó la app: ' + BASE)

  // Sesión sembrada + recarga para que React lea el localStorage en el primer render.
  await evaluate(
    `localStorage.setItem('lpf-session', JSON.stringify({ token: 't', user: { id: 'u1', name: 'Árbitro', role: 'arbitro' } }))`,
  )
  await send('Page.reload', { ignoreCache: true })
  await waitFor(`document.readyState === 'complete' && document.querySelector('article') !== null`)

  // Abre el primer partido (upcoming) y espera al tablero.
  let opened = false
  for (let i = 0; i < 10 && !opened; i++) {
    await evaluate(`(() => { const a = document.querySelector('article'); if (a) a.click() })()`)
    opened = await waitFor(`document.querySelector('.pitch-box') !== null`, 800)
  }
  if (!opened) {
    const diag = await evaluate(`({
      articles: document.querySelectorAll('article').length,
      hasPitch: !!document.querySelector('.pitch-box'),
      ls: (() => { try { return localStorage.getItem('lpf-session') } catch { return 'ERR' } })(),
      text: document.body ? document.body.innerText.slice(0, 160) : null,
      rootLen: document.getElementById('root') ? document.getElementById('root').innerHTML.length : -1,
      rootHtml: document.getElementById('root') ? document.getElementById('root').innerHTML.slice(0, 300) : null,
    })`)
    throw new Error('no se abrió el partido en vivo: ' + JSON.stringify(diag) + '\nerrors: ' + JSON.stringify(pageErrors.slice(-6)))
  }
  await new Promise((r) => setTimeout(r, 300))
}

// ---------------------------------------------------------------------------
// 4. Validaciones + capturas
// ---------------------------------------------------------------------------
mkdirSync(join(process.cwd(), 'tools', 'shots'), { recursive: true })

let allOk = true

function ok(cond, label, detail = '') {
  const mark = cond ? 'OK  ' : 'FAIL'
  if (!cond) allOk = false
  console.log(`  [${mark}] ${label}${detail ? '  → ' + detail : ''}`)
}

try {
  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`)
    await openLiveMatch(vp.width, vp.height)

    const info = await evaluate(`(() => {
      const box = document.querySelector('.pitch-box')
      const stage = document.querySelector('.pitch-stage')
      const grass = document.querySelector('[data-grass]')
      const rail = document.querySelector('[data-rail]')
      const buttons = [...document.querySelectorAll('[data-action]')]
      const back = document.querySelector('button[aria-label="Volver"]')
      const header = back ? back.parentElement : null
      const headerRect = header ? header.getBoundingClientRect() : null
      const boxRect = box ? box.getBoundingClientRect() : null
      const stageRect = stage ? stage.getBoundingClientRect() : null
      const grassRect = grass ? grass.getBoundingClientRect() : null
      const railRect = rail ? rail.getBoundingClientRect() : null
      const timeline = document.querySelector('.live-timeline')
      const timelineRect = timeline ? timeline.getBoundingClientRect() : null
      const coarse = matchMedia('(pointer: coarse)').matches
      const fine = matchMedia('(pointer: fine)').matches
      const within = railRect
        ? buttons.every((b) => {
            const r = b.getBoundingClientRect()
            return r.top >= railRect.top - 1 && r.bottom <= railRect.bottom + 1 && r.left >= railRect.left - 1 && r.right <= railRect.right + 1
          })
        : false
      const coversViewport = (r) =>
        r && Math.abs(r.left) < 1 && Math.abs(r.top) < 1 && Math.abs(r.width - innerWidth) < 1 && Math.abs(r.height - innerHeight) < 1
      return {
        coarse, fine,
        vw: innerWidth, vh: innerHeight,
        headerH: headerRect ? Math.round(headerRect.height) : null,
        headerBottom: headerRect ? Math.round(headerRect.bottom) : null,
        box: boxRect ? { w: Math.round(boxRect.width), h: Math.round(boxRect.height), ar: boxRect.width / boxRect.height } : null,
        stageCovers: coversViewport(stageRect),
        grassCovers: coversViewport(grassRect),
        rail: railRect ? { w: Math.round(railRect.width), h: Math.round(railRect.height), top: Math.round(railRect.top), bottom: Math.round(railRect.bottom) } : null,
        timeline: timelineRect ? { top: Math.round(timelineRect.top), bottom: Math.round(timelineRect.bottom) } : null,
        buttonsCount: buttons.length,
        allWithin: within,
        railScrollable: rail ? rail.scrollHeight > rail.clientHeight : null,
      }
    })()`)

    console.log(`  pointer coarse=${info.coarse} fine=${info.fine}`)
    ok(info.coarse, 'emula puntero táctil (coarse)')
    ok(info.stageCovers, 'escenario a sangre cubre el viewport', `${info.vw}x${info.vh}`)
    ok(info.grassCovers, 'césped cubre los 4 bordes (sin bandas oscuras)')
    ok(info.headerH != null && info.headerH >= 44 && info.headerH <= 78, 'header dentro de su banda', `${info.headerH}px`)
    ok(info.box != null, 'caja del campo presente')
    if (info.box) {
      const arOk = Math.abs(info.box.ar - EXPECT_AR) / EXPECT_AR < 0.005
      ok(arOk, 'relación de aspecto 976:560 (sin distorsión)', `AR=${info.box.ar.toFixed(4)} (esperado ${EXPECT_AR.toFixed(4)}) · ${info.box.w}x${info.box.h}`)
    }
    ok(info.buttonsCount === 8, '8 acciones en el rail', `${info.buttonsCount} botones`)
    ok(info.allWithin, 'las 8 acciones caben dentro del rail (sin scroll)', `rail ${info.rail?.w}x${info.rail?.h}px`)
    ok(info.railScrollable === false, 'rail sin scroll interno', `scrollable=${info.railScrollable}`)
    ok(info.rail && info.headerBottom != null && info.rail.top >= info.headerBottom - 1, 'rail no se solapa con el header', `rail.top=${info.rail?.top} header.bottom=${info.headerBottom}`)
    ok(info.rail && info.timeline && info.rail.bottom <= info.timeline.top + 1, 'rail no se solapa con el timeline', `rail.bottom=${info.rail?.bottom} timeline.top=${info.timeline?.top}`)

    const shot = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}.png`), Buffer.from(shot.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}.png`)
  }
} finally {
  chrome.kill()
  await server.close()
  try {
    rmSync(userDataDir, { recursive: true, force: true })
  } catch {
    /* noop */
  }
  ws.close()
}

console.log('\n' + (allOk ? 'LAYOUT CHECK: OK' : 'LAYOUT CHECK: FALLO'))
process.exit(allOk ? 0 : 1)

