// tools/layout-check.mjs
// Abre "Registro de partido" (vertical) en Chrome headless a 4 tamaños (móvil/tablet),
// valida el panel (cabecera, marcador, pestañas, grid 3×2 y CTA) y guarda capturas
// en tools/shots/.
//
// Uso: node --experimental-websocket tools/layout-check.mjs
// Requiere: Chrome instalado (C:\Program Files\Google\Chrome\Application\chrome.exe).

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
  { name: 'phone-390x844', width: 390, height: 844 },
  { name: 'phone-430x932', width: 430, height: 932 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-820x1180', width: 820, height: 1180 },
]

// ---------------------------------------------------------------------------
// 1. Servidor de preview (o dev con `--dev`, que sirve ESM y evita el error de React
//    del bundle de producción en Chrome headless).
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
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })

  await send('Page.navigate', { url: BASE + '/' })
  const loaded = await waitFor(
    `location.href.startsWith('${BASE}') && document.readyState === 'complete'`,
    USE_DEV ? 30000 : 6000,
  )
  if (!loaded) throw new Error('no cargó la app: ' + BASE)

  await evaluate(
    `localStorage.setItem('lpf-session', JSON.stringify({ token: 't', user: { id: 'u1', name: 'Árbitro', role: 'arbitro' } }))`,
  )
  await send('Page.reload', { ignoreCache: true })
  await waitFor(`document.readyState === 'complete' && document.querySelector('article') !== null`)

  // Home → Detalle → Cargar alineaciones → Registro de partido.
  let opened = false
  for (let i = 0; i < 10 && !opened; i++) {
    await evaluate(`(() => { const a = document.querySelector('article'); if (a) a.click() })()`)
    const detailShown = await waitFor(`document.querySelector('[data-detail-next]') !== null`, 800)
    if (!detailShown) continue
    await evaluate(`(() => { const b = document.querySelector('[data-detail-next]'); if (b) b.click() })()`)
    const lineupShown = await waitFor(`document.querySelector('[data-lineup-next]') !== null`, 800)
    if (!lineupShown) continue
    await evaluate(`(() => { const b = document.querySelector('[data-lineup-next]'); if (b) b.click() })()`)
    opened = await waitFor(`document.querySelector('[data-live-grid]') !== null`, 800)
  }
  if (!opened) {
    const diag = await evaluate(`({
      articles: document.querySelectorAll('article').length,
      hasGrid: !!document.querySelector('[data-live-grid]'),
      hasLineup: !!document.querySelector('[data-lineup]'),
      hasDetail: !!document.querySelector('[data-detail-next]'),
      ls: (() => { try { return localStorage.getItem('lpf-session') } catch { return 'ERR' } })(),
      text: document.body ? document.body.innerText.slice(0, 160) : null,
      rootHtml: document.getElementById('root') ? document.getElementById('root').innerHTML.slice(0, 300) : null,
    })`)
    throw new Error('no se abrió el partido en vivo: ' + JSON.stringify(diag) + '\nerrors: ' + JSON.stringify(pageErrors.slice(-6)))
  }
  await new Promise((r) => setTimeout(r, 300))
}

// Abre la Lista Previa del Comisionado: limpia sesión → App Comisionado → login → card → checklist.
async function openPreMatchChecklist(width, height) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: width,
    screenHeight: height,
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })

  await send('Page.navigate', { url: BASE + '/' })
  const loaded = await waitFor(
    `location.href.startsWith('${BASE}') && document.readyState === 'complete'`,
    USE_DEV ? 30000 : 6000,
  )
  if (!loaded) throw new Error('no cargó la app (pre): ' + BASE)

  // Sin sesión → selector de rol.
  await evaluate(`(() => { localStorage.clear(); sessionStorage.clear() })()`)
  await send('Page.reload', { ignoreCache: true })
  await waitFor(`document.readyState === 'complete'`)

  if (!(await waitFor(`[...document.querySelectorAll('button')].some((b) => b.textContent.includes('App Comisionado'))`, 8000))) {
    throw new Error('no apareció el selector de rol (pre)')
  }
  await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('App Comisionado')); if (b) b.click() })()`)

  // Login mock con credenciales precargadas.
  if (!(await waitFor(`[...document.querySelectorAll('button')].some((b) => b.textContent.includes('Iniciar sesión'))`, 8000))) {
    throw new Error('no apareció el login (pre)')
  }
  await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Iniciar sesión')); if (b) b.click() })()`)

  // Home → card → Lista Previa.
  await waitFor(`document.querySelector('article') !== null`, 10000)
  let opened = false
  for (let i = 0; i < 10 && !opened; i++) {
    await evaluate(`(() => { const a = document.querySelector('article'); if (a) a.click() })()`)
    opened = await waitFor(`document.querySelector('[data-pre]') !== null`, 800)
  }
  if (!opened) throw new Error('no se abrió la Lista Previa (pre)')
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
      const grid = document.querySelector('[data-live-grid]')
      const cells = [...document.querySelectorAll('[data-live-action]')]
      const tabs = [...document.querySelectorAll('[data-tab]')]
      const header = document.querySelector('header')
      const score = document.querySelector('[data-live-score]')
      const pill = document.querySelector('[data-live-pill]')
      const back = !!document.querySelector('[data-live-back]')
      const next = !!document.querySelector('[data-live-next]')
      const gridRect = grid ? grid.getBoundingClientRect() : null
      const headerRect = header ? header.getBoundingClientRect() : null
      const cellRects = cells.map((c) => c.getBoundingClientRect())
      const cols = gridRect && cellRects.length ? Math.round(gridRect.width / Math.max(1, cellRects[0].width)) : null
      const activeTab = document.querySelector('[data-tab][aria-pressed="true"]')
      return {
        vw: innerWidth, vh: innerHeight,
        grid: gridRect ? { w: Math.round(gridRect.width), h: Math.round(gridRect.height) } : null,
        cells: cells.length,
        tabs: tabs.length,
        activeTab: activeTab ? activeTab.getAttribute('data-tab') : null,
        score: score ? score.textContent.trim() : null,
        pill: pill ? pill.textContent.trim() : null,
        headerH: headerRect ? Math.round(headerRect.height) : null,
        back,
        next,
        cols,
      }
    })()`)

    ok(info.grid != null, 'grid de acciones presente')
    ok(info.cells === 6, '6 acciones en el grid', `${info.cells} celdas`)
    ok(info.tabs === 3, '3 pestañas', `${info.tabs}`)
    ok(info.activeTab === 'events', 'pestaña activa por defecto = Eventos', info.activeTab ?? '')
    ok(info.score === '0 – 0', 'marcador inicial 0 – 0', info.score ?? '')
    ok(info.pill != null && info.pill.toLowerCase().includes('vivo'), 'pill EN VIVO presente', info.pill ?? '')
    ok(info.headerH != null && info.headerH >= 56, 'cabecera presente', `${info.headerH}px`)
    ok(info.back, 'Registro de partido muestra Volver', '')
    ok(info.next, 'Registro de partido muestra Siguiente', '')
    ok(info.cols === 3, 'grid en 3 columnas', `${info.cols} col`)

    // Cambio de pestañas → contenido distinto.
    await evaluate(`(() => { const t = document.querySelector('[data-tab="lineup"]'); if (t) t.click() })()`)
    ok(await waitFor(`document.querySelector('[data-live-lineup]') !== null`, 800), 'pestaña Alineaciones muestra titulares')

    // Pestaña Logs → abre un sidebar lateral con el historial.
    await evaluate(`(() => { const t = document.querySelector('[data-tab="logs"]'); if (t) t.click() })()`)
    ok(await waitFor(`document.querySelector('[data-logs-sidebar]') !== null`, 800), 'pestaña Logs abre el sidebar de eventos')
    await evaluate(`(() => { const x = document.querySelector('[data-logs-sidebar] button[aria-label="Cerrar logs"]'); if (x) x.click() })()`)
    await waitFor(`document.querySelector('[data-logs-sidebar]') === null`, 800)

    // Volver a Eventos y abrir una acción → pantalla de registro a pantalla completa.
    await evaluate(`(() => { const t = document.querySelector('[data-tab="events"]'); if (t) t.click() })()`)
    await waitFor(`document.querySelector('[data-live-grid]') !== null`, 800)
    await evaluate(`(() => { const b = document.querySelector('[data-live-action="ball"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-drawer][aria-label="Registrar gol"]') !== null`, 800), 'abrir acción muestra la pantalla de registro')

    const shotDrawer = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-drawer.png`), Buffer.from(shotDrawer.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-drawer.png`)

    // Registrar gol: titular local preseleccionado → Guardar gol → 1 – 0.
    await evaluate(`(() => {
      const save = document.querySelector('[data-drawer] button[data-save]'); if (save) save.click()
    })()`)
    ok(await waitFor(`document.querySelector('[data-live-score]')?.textContent.trim() === '1 – 0'`, 800), 'registrar gol incrementa el marcador a 1 – 0')

    // El registro se cierra al guardar; capturar el panel principal.
    await new Promise((r) => setTimeout(r, 300))
    const shotMain = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}.png`), Buffer.from(shotMain.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}.png`)

    // Flujo tarjeta amarilla: tipos con icono, Motivo (input) y Observaciones.
    await evaluate(`(() => { const c = document.querySelector('[data-live-action="yellow"]'); if (c) c.click() })()`)
    ok(await waitFor(`document.querySelector('[data-drawer][aria-label="Registrar tarjeta"]') !== null`, 800), 'abrir tarjeta muestra la pantalla de registro')
    ok(await waitFor(`document.querySelector('[data-cardtype="yellow"][aria-pressed="true"]') !== null`, 800), 'tarjeta amarilla preseleccionada')
    ok(await waitFor(`document.querySelector('[data-drawer] input[data-reason]') !== null`, 800), 'campo Motivo (input) presente')
    ok(await waitFor(`document.querySelector('[data-drawer] textarea[data-note]') !== null`, 800), 'campo Observaciones presente')
    await evaluate(`(() => { const b = document.querySelector('[data-drawer] button[data-save]'); if (b) b.click() })()`)
    await waitFor(`document.querySelector('[data-drawer]') === null`, 800)

    // Flujo cambio: selector de equipo con nombres reales, dos selectores de jugador y Observaciones.
    await evaluate(`(() => { const c = document.querySelector('[data-live-action="sub"]'); if (c) c.click() })()`)
    ok(await waitFor(`document.querySelector('[data-drawer][aria-label="Registrar cambio"]') !== null`, 800), 'abrir cambio muestra la pantalla de registro')
    ok(await waitFor(`document.querySelectorAll('[data-drawer] [data-player-select]').length === 2`, 800), 'cambio muestra jugador que sale e ingresa')
    ok(await waitFor(`document.querySelector('[data-drawer] [data-player-icon="out"]') !== null`, 800), 'icono de salida (rojo) presente')
    ok(await waitFor(`document.querySelector('[data-drawer] [data-player-icon="in"]') !== null`, 800), 'icono de ingreso (verde) presente')
    ok(await waitFor(`document.querySelector('[data-drawer] textarea[data-note]') !== null`, 800), 'cambio muestra Observaciones')
    ok(await waitFor(`document.querySelector('[data-drawer] button[data-save]')?.textContent.trim() === 'Guardar cambio'`, 800), 'CTA Guardar cambio')
    await evaluate(`(() => { const b = document.querySelector('[data-drawer] button[data-save]'); if (b) b.click() })()`)

    // Flujo incidencia: lista de tipos con icono, Descripción y CTA Guardar incidencia.
    await evaluate(`(() => { const c = document.querySelector('[data-live-action="injury"]'); if (c) c.click() })()`)
    ok(await waitFor(`document.querySelector('[data-drawer][aria-label="Registrar incidencia"]') !== null`, 800), 'abrir incidencia muestra la pantalla de registro')
    ok(await waitFor(`document.querySelectorAll('[data-drawer] [data-incident-option]').length === 5`, 800), 'incidencia muestra 5 tipos')
    ok(await waitFor(`document.querySelector('[data-drawer] [data-incident-option="injury"][aria-pressed="true"]') !== null`, 800), 'Lesión preseleccionada')
    ok(await waitFor(`document.querySelector('[data-drawer] [data-minute]') !== null`, 800), 'registro de evento muestra el campo Minuto')
    ok(await waitFor(`document.querySelector('[data-drawer] textarea[data-note]') !== null`, 800), 'incidencia muestra Descripción')
    ok(await waitFor(`document.querySelector('[data-drawer] button[data-save]')?.textContent.trim() === 'Guardar incidencia'`, 800), 'CTA Guardar incidencia')
    await evaluate(`(() => { const b = document.querySelector('[data-drawer] button[data-save]'); if (b) b.click() })()`)

    // ── Siguiente → Acta (primera pantalla). ──
    ok(await waitFor(`document.querySelector('[data-live-end-times]') !== null`, 800), 'marcador muestra inicio - finalización')
    await evaluate(`(() => { const b = document.querySelector('[data-live-next]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-acta]') !== null`, 1000), 'Siguiente abre el Acta (primera pantalla)')
    ok(await waitFor(`document.querySelector('[data-acta-score]') !== null`, 800), 'acta muestra el marcador final')
    ok(await waitFor(`document.querySelector('[data-acta-clear]') !== null`, 800), 'acta muestra el botón Limpiar')
    ok(await waitFor(`document.querySelector('[data-acta-close]') !== null`, 800), 'acta muestra el CTA Cerrar acta del partido')

    // Cerrar acta → documento oficial "INFORME DEL ÁRBITRO" (banner + Cancelar + PDF).
    await evaluate(`(() => { const b = document.querySelector('[data-acta-close]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-acta-doc]') !== null`, 1000), 'Cerrar acta abre el documento')
    ok(await waitFor(`document.querySelector('[data-acta-banner]') !== null`, 800), 'documento muestra el banner de informe enviado')
    ok(await waitFor(`document.querySelector('[data-acta-home]') !== null`, 800), 'documento muestra Volver inicio')
    ok(await waitFor(`document.querySelector('[data-acta-pdf]') !== null`, 800), 'documento muestra Guardar y descargar PDF')

    const shotActa = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-acta.png`), Buffer.from(shotActa.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-acta.png`)
  }

  // ── Flujo Comisionado: Lista Previa (Antes del partido). ──
  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name}-pre (${vp.width}x${vp.height}) ===`)
    await openPreMatchChecklist(vp.width, vp.height)

    const info = await evaluate(`(() => ({
      rows: document.querySelectorAll('[data-pre-row]').length,
      pill: document.querySelector('[data-pre-pill]')?.textContent.trim() ?? null,
      next: document.querySelector('[data-pre-next]')?.textContent.trim() ?? null,
      back: !!document.querySelector('[data-pre-back]'),
    }))()`)

    ok(info.rows === 7, 'Lista Previa muestra 7 ítems', `${info.rows} filas`)
    ok(info.pill != null && info.pill.includes('Verificado en sitio'), 'pill Verificado en sitio presente', info.pill ?? '')
    ok(info.next != null && info.next.includes('Siguiente'), 'CTA Siguiente presente', info.next ?? '')
    ok(info.back, 'botón volver (cuadrado) presente', '')

    // Estado inicial: ninguna opción preseleccionada (ni valor ni check verde).
    const initial = await evaluate(`document.querySelector('[data-pre-row="lighting"]')?.textContent ?? ''`)
    ok(!initial.includes('Funciona correctamente'), 'ninguna opción aparece seleccionada de entrada', '')
    ok(await waitFor(`document.querySelector('[data-pre-row="lighting"] [data-pre-check]') === null`, 400), 'sin check verde de entrada', '')

    // Tocar una fila selecciona la primera opción: muestra el valor y el check verde.
    await evaluate(`(() => { const r = document.querySelector('[data-pre-row="lighting"]'); if (r) r.click() })()`)
    ok(await waitFor(`document.querySelector('[data-pre-row="lighting"]')?.textContent.includes('Funciona correctamente')`, 800), 'tocar una fila selecciona la primera opción', '')
    ok(await waitFor(`document.querySelector('[data-pre-row="lighting"] [data-pre-check]') !== null`, 800), 'check verde aparece al seleccionar', '')

    const shotPre = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-pre.png`), Buffer.from(shotPre.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-pre.png`)
  }

  // ── Flujo Comisionado: Inicio del partido. ──
  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name}-start (${vp.width}x${vp.height}) ===`)
    await openPreMatchChecklist(vp.width, vp.height)
    await evaluate(`(() => { const b = document.querySelector('[data-pre-next]'); if (b) b.click() })()`)
    if (!(await waitFor(`document.querySelector('[data-start]') !== null`, 1500))) {
      throw new Error('no se abrió Inicio del partido (start)')
    }

    const info = await evaluate(`(() => ({
      kickoff: !!document.querySelector('[data-start-kickoff]'),
      time: document.querySelector('[data-start-time]')?.textContent.trim() ?? null,
      finalKickoff: !!document.querySelector('[data-start-final-kickoff]'),
      finalTime: document.querySelector('[data-start-final-time]')?.textContent.trim() ?? null,
      extraRows: document.querySelectorAll('[data-start-extra]').length,
      delays: document.querySelectorAll('[data-start-delay]').length,
      back: document.querySelector('[data-start-back]')?.textContent.trim() ?? null,
      next: document.querySelector('[data-start-next]')?.textContent.trim() ?? null,
      noPressed: document.querySelector('[data-start-delay="local"] [data-start-option="no"]')?.getAttribute('aria-pressed') ?? null,
      yesPressed: document.querySelector('[data-start-delay="local"] [data-start-option="yes"]')?.getAttribute('aria-pressed') ?? null,
    }))()`)

    ok(info.kickoff, 'tarjeta de pitazo inicial presente', '')
    ok(info.time === '--:--', 'hora inicial --:--', info.time ?? '')
    ok(info.finalKickoff, 'tarjeta de pitazo final presente', '')
    ok(info.finalTime === '--:--', 'hora final --:--', info.finalTime ?? '')
    ok(info.extraRows === 2, '2 periodos de tiempo extra', `${info.extraRows} filas`)
    ok(info.delays === 3, '3 preguntas de retraso', `${info.delays} filas`)
    ok(info.back != null && info.back.includes('Volver'), 'CTA Volver presente', info.back ?? '')
    ok(info.next != null && info.next.includes('Siguiente'), 'CTA Siguiente presente', info.next ?? '')
    ok(info.noPressed === 'true', 'opción No seleccionada por defecto', `no=${info.noPressed}`)
    ok(info.yesPressed === 'false', 'opción Sí sin seleccionar', `yes=${info.yesPressed}`)

    const shotStart = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-start.png`), Buffer.from(shotStart.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-start.png`)

    // Cambiar la respuesta "local" a Sí.
    await evaluate(`(() => { const b = document.querySelector('[data-start-delay="local"] [data-start-option="yes"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-start-delay="local"] [data-start-option="yes"]')?.getAttribute('aria-pressed') === 'true'`, 800), 'Sí queda seleccionado al tocar', '')
    ok(await waitFor(`document.querySelector('[data-start-delay="local"] [data-start-option="no"]')?.getAttribute('aria-pressed') === 'false'`, 800), 'No se deselecciona al tocar Sí', '')

    // Registrar pitazo inicial → rellena la hora real de inicio (sin navegar).
    await evaluate(`(() => { const b = document.querySelector('[data-start-kickoff]'); if (b) b.click() })()`)
    ok(await waitFor(`(() => { const t = document.querySelector('[data-start-time]')?.textContent.trim(); return t && t !== '--:--' && /^[0-9]{2}:[0-9]{2}$/.test(t) })()`, 800), 'registrar pitazo inicial rellena la hora', '')

    // Registrar pitazo final → rellena la hora real de finalización.
    await evaluate(`(() => { const b = document.querySelector('[data-start-final-kickoff]'); if (b) b.click() })()`)
    ok(await waitFor(`(() => { const t = document.querySelector('[data-start-final-time]')?.textContent.trim(); return t && t !== '--:--' && /^[0-9]{2}:[0-9]{2}$/.test(t) })()`, 800), 'registrar pitazo final rellena la hora', '')

    // Tiempo extra por periodo: sumar minutos al primer tiempo.
    await evaluate(`(() => { const b = document.querySelector('[data-start-extra="first"] [data-start-extra-plus]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-start-extra="first"] [data-start-extra-value]')?.textContent.includes('1 min')`, 800), 'tiempo extra suma minutos al primer tiempo', '')

    // Siguiente → Registro de partido.
    await evaluate(`(() => { const b = document.querySelector('[data-start-next]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-live-grid]') !== null`, 1200), 'Siguiente abre Registro de partido', '')

    // El flujo comisionado muestra Volver + Siguiente (sin Finalizar/Pausar).
    ok(await waitFor(`document.querySelector('[data-live-back]') !== null`, 800), 'Registro de partido muestra Volver', '')
    ok(await waitFor(`document.querySelector('[data-live-next]') !== null`, 800), 'Registro de partido muestra Siguiente', '')
    ok(await waitFor(`document.querySelector('[data-finish-half]') === null && document.querySelector('[data-pause-match]') === null`, 400), 'sin Finalizar/Pausar en el flujo comisionado', '')
    ok(await waitFor(`document.querySelector('[data-live-end-times]') !== null`, 800), 'comisionado: inicio - finalización debajo del marcador', '')
    ok(await waitFor(`document.querySelector('[data-clock]') === null`, 400), 'comisionado: sin cronómetro', '')

    const shotLive = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-live.png`), Buffer.from(shotLive.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-live.png`)

    // Siguiente → Acta (primera pantalla).
    await evaluate(`(() => { const b = document.querySelector('[data-live-next]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-acta]') !== null`, 1000), 'Siguiente abre el Acta (primera pantalla)', '')
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