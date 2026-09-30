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
      const trigger = document.querySelector('[data-rail-trigger]')
      const back = document.querySelector('button[aria-label="Volver"]')
      const header = back ? back.parentElement : null
      const headerRect = header ? header.getBoundingClientRect() : null
      const boxRect = box ? box.getBoundingClientRect() : null
      const stageRect = stage ? stage.getBoundingClientRect() : null
      const grassRect = grass ? grass.getBoundingClientRect() : null
      const triggerRect = trigger ? trigger.getBoundingClientRect() : null
      const timeline = document.querySelector('.live-timeline')
      const timelineRect = timeline ? timeline.getBoundingClientRect() : null
      const coarse = matchMedia('(pointer: coarse)').matches
      const fine = matchMedia('(pointer: fine)').matches
      const coversViewport = (r) =>
        r && Math.abs(r.left) < 1 && Math.abs(r.top) < 1 && Math.abs(r.width - innerWidth) < 1 && Math.abs(r.height - innerHeight) < 1
      const center = boxRect
        ? document.elementFromPoint(boxRect.left + boxRect.width / 2, boxRect.top + boxRect.height / 2)
        : null
      const centerInBox = center ? !!center.closest('.pitch-box') : false
      return {
        coarse, fine,
        vw: innerWidth, vh: innerHeight,
        headerH: headerRect ? Math.round(headerRect.height) : null,
        headerBottom: headerRect ? Math.round(headerRect.bottom) : null,
        box: boxRect ? { w: Math.round(boxRect.width), h: Math.round(boxRect.height), ar: boxRect.width / boxRect.height } : null,
        stageCovers: coversViewport(stageRect),
        grassCovers: coversViewport(grassRect),
        railClosed: document.querySelector('[data-rail]') === null,
        trigger: triggerRect ? { w: Math.round(triggerRect.width), h: Math.round(triggerRect.height) } : null,
        centerInBox,
        timeline: timelineRect ? { top: Math.round(timelineRect.top), bottom: Math.round(timelineRect.bottom) } : null,
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
    ok(info.railClosed, 'panel de acciones cerrado por defecto (cancha despejada)')
    ok(info.trigger != null && info.trigger.w <= 64 && info.trigger.h <= 64, 'trigger compacto', info.trigger ? `${info.trigger.w}x${info.trigger.h}px` : 'sin trigger')
    ok(info.centerInBox, 'centro de la cancha despejado', 'elementFromPoint dentro de .pitch-box')

    // Barra de marcador: orden `nombre·escudo·marcador` (local) / espejado (visitante) + cronómetro centrado.
    const score = await evaluate(`(() => {
      const bar = document.querySelector('[data-scoreboard]')
      if (!bar) return null
      const b = bar.getBoundingClientRect()
      const clock = document.querySelector('[data-clock]')
      const c = clock ? clock.getBoundingClientRect() : null
      const home = document.querySelector('[data-score="home"]')
      const away = document.querySelector('[data-score="away"]')
      const order = (block, scoreEl) =>
        block ? [...block.children].map((n) => (n === scoreEl ? 'score' : n.tagName === 'IMG' ? 'crest' : n.tagName === 'P' ? 'name' : 'other')).join(',') : null
      return {
        w: Math.round(b.width),
        homeOrder: order(home?.parentElement ?? null, home),
        awayOrder: order(away?.parentElement ?? null, away),
        clockCentered: c != null && Math.abs(c.left + c.width / 2 - (b.left + b.width / 2)) < 2,
        homeW: home ? Math.round(home.getBoundingClientRect().width) : 0,
        awayW: away ? Math.round(away.getBoundingClientRect().width) : 0,
      }
    })()`)
    ok(score != null, 'barra de marcador presente')
    if (score) {
      ok(score.homeOrder === 'name,crest,score', 'orden local: nombre·escudo·marcador', score.homeOrder ?? '')
      ok(score.awayOrder === 'score,crest,name', 'orden visitante: marcador·escudo·nombre', score.awayOrder ?? '')
      ok(score.clockCentered, 'cronómetro centrado en la barra')
      ok(score.homeW > 0 && score.awayW > 0, 'marcadores visibles sin recorte', `${score.homeW}x${score.awayW}`)
    }

    const shotClosed = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}.png`), Buffer.from(shotClosed.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}.png`)

    // Abre el sidebar modal de acciones.
    await evaluate(`(() => { const t = document.querySelector('[data-rail-trigger]'); if (t) t.click() })()`)
    const opened = await waitFor(`document.querySelector('[data-rail]') !== null`, 800)
    ok(opened, 'se abre el panel de acciones', opened ? '' : 'no apareció [data-rail]')

    const sheet = await evaluate(`(() => {
      const rail = document.querySelector('[data-rail]')
      const railRect = rail ? rail.getBoundingClientRect() : null
      const buttons = [...document.querySelectorAll('[data-rail] [data-action]')]
      const within = railRect
        ? buttons.every((b) => {
            const r = b.getBoundingClientRect()
            return r.top >= railRect.top - 1 && r.bottom <= railRect.bottom + 1 && r.left >= railRect.left - 1 && r.right <= railRect.right + 1
          })
        : false
      const back = document.querySelector('button[aria-label="Volver"]')
      const header = back ? back.parentElement : null
      const headerBottom = header ? Math.round(header.getBoundingClientRect().bottom) : null
      const timeline = document.querySelector('.live-timeline')
      const timelineTop = timeline ? Math.round(timeline.getBoundingClientRect().top) : null
      return {
        rail: railRect ? { w: Math.round(railRect.width), h: Math.round(railRect.height), top: Math.round(railRect.top), bottom: Math.round(railRect.bottom) } : null,
        buttonsCount: buttons.length,
        allWithin: within,
        scrollable: rail ? rail.scrollHeight > rail.clientHeight : null,
        headerBottom,
        timelineTop,
      }
    })()`)

    ok(sheet.buttonsCount === 8, '8 acciones en el panel', `${sheet.buttonsCount} botones`)
    ok(sheet.allWithin, 'las 8 acciones caben dentro del panel (sin scroll)', `panel ${sheet.rail?.w}x${sheet.rail?.h}px`)
    ok(sheet.scrollable === false, 'panel sin scroll interno', `scrollable=${sheet.scrollable}`)
    ok(sheet.rail && sheet.headerBottom != null && sheet.rail.top >= sheet.headerBottom - 1, 'panel no se solapa con el header', `panel.top=${sheet.rail?.top} header.bottom=${sheet.headerBottom}`)
    ok(sheet.rail && sheet.timelineTop != null && sheet.rail.bottom <= sheet.timelineTop + 1, 'panel no se solapa con el timeline', `panel.bottom=${sheet.rail?.bottom} timeline.top=${sheet.timelineTop}`)

    const shotOpen = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-sheet.png`), Buffer.from(shotOpen.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-sheet.png`)

    // Elige una acción: cierra el panel y abre el drawer de evento.
    await evaluate(`(() => { const b = document.querySelector('[data-rail] [data-action="goal"]'); if (b) b.click() })()`)
    const after = await waitFor(
      `document.querySelector('[data-rail]') === null && document.querySelector('aside[aria-label="Registrar gol"]') !== null`,
      800,
    )
    ok(after, 'elegir acción cierra el panel y abre el drawer', after ? '' : 'no pasó a registrar gol')

    // Los 11 titulares deben caber en la grilla sin scroll interno.
    const drawer = await evaluate(`(() => {
      const scroll = document.querySelector('[data-drawer-scroll]')
      const cells = [...document.querySelectorAll('[data-drawer-cell]')]
      const box = scroll ? scroll.getBoundingClientRect() : null
      const inside = box
        ? cells.every((c) => {
            const r = c.getBoundingClientRect()
            return r.top >= box.top - 1 && r.bottom <= box.bottom + 1 && r.left >= box.left - 1 && r.right <= box.right + 1
          })
        : false
      return {
        count: cells.length,
        inside,
        scrollable: scroll ? scroll.scrollHeight > scroll.clientHeight + 1 : null,
        scrollH: scroll ? scroll.scrollHeight : null,
        clientH: scroll ? scroll.clientHeight : null,
      }
    })()`)
    ok(drawer.count === 11, '11 titulares en la grilla', `${drawer.count} celdas`)
    ok(drawer.inside, 'las 11 celdas caben dentro del panel')
    ok(drawer.scrollable === false, 'panel sin scroll (11/11 visibles)', `scrollH=${drawer.scrollH} clientH=${drawer.clientH}`)

    // Seleccionar celda → queda marcada y sincroniza con la cancha.
    await evaluate(`(() => { const c = document.querySelector('[data-drawer-cell][data-player-id="h11"]'); if (c) c.click() })()`)
    const picked = await waitFor(
      `document.querySelector('[data-drawer-cell][data-player-id="h11"]')?.getAttribute('aria-pressed') === 'true'`,
      800,
    )
    ok(picked, 'celda seleccionada (aria-pressed) y sincronizada')

    // Ficha del jugador al tocar un dorsal de la cancha.
    await evaluate(`(() => { const x = document.querySelector('[data-drawer] button[aria-label="Cerrar"]'); if (x) x.click() })()`)
    await waitFor(`document.querySelector('[data-drawer]') === null`, 800)
    await evaluate(`(() => { const m = document.querySelector('button[aria-label^="R. Cedeño"]'); if (m) m.click() })()`)
    const cardShown = await waitFor(`document.querySelector('[data-player-card]') !== null`, 800)
    ok(cardShown, 'ficha del jugador aparece al tocar el dorsal')
    const card = await evaluate(`(() => {
      const el = document.querySelector('[data-player-card]')
      const box = document.querySelector('.pitch-box')
      if (!el || !box) return null
      const r = el.getBoundingClientRect()
      const b = box.getBoundingClientRect()
      return {
        name: el.querySelector('[data-card-name]')?.textContent ?? '',
        pos: el.querySelector('[data-card-position]')?.textContent ?? '',
        inside: r.left >= b.left - 1 && r.right <= b.right + 1 && r.top >= b.top - 1 && r.bottom <= b.bottom + 1,
      }
    })()`)
    if (card) {
      ok(card.name.length > 0 && card.pos.length > 0, 'ficha muestra nombre y posición', `${card.name} · ${card.pos}`)
      ok(card.inside, 'ficha dentro de los límites de la cancha')
    }

    // Regresión de tarjeta: registrar "Roja" debe pintar booking rojo en el marcador.
    await evaluate(`(() => { const t = document.querySelector('[data-rail-trigger]'); if (t) t.click() })()`)
    await waitFor(`document.querySelector('[data-rail]') !== null`, 800)
    await evaluate(`(() => { const b = document.querySelector('[data-rail] [data-action="card"]'); if (b) b.click() })()`)
    await waitFor(`document.querySelector('aside[aria-label="Registrar tarjeta"]') !== null`, 800)
    await evaluate(`(() => {
      const cell = document.querySelector('[data-drawer-cell][data-player-id="h11"]'); if (cell) cell.click()
      const red = [...document.querySelectorAll('[data-drawer] button')].find((b) => b.textContent === 'Roja'); if (red) red.click()
      const save = [...document.querySelectorAll('[data-drawer] button')].find((b) => b.textContent === 'Guardar'); if (save) save.click()
    })()`)
    const booking = await waitFor(
      `document.querySelector('button[aria-label^="R. Cedeño"] [data-booking="red"]') !== null`,
      800,
    )
    ok(booking, 'tarjeta roja registrada → booking rojo en el marcador')

    const shotCard = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-card.png`), Buffer.from(shotCard.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-card.png`)
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

