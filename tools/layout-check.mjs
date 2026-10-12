// tools/layout-check.mjs
// Abre el flujo en vivo (vertical) en Chrome headless a 4 tamaños (móvil/tablet),
// valida las 5 pantallas de registro (Gol → Cambios → Sanciones → Lesionados → Incidencias)
// y su navegación Volver/Siguiente, además de Alineaciones/Logs; guarda capturas en tools/shots/.
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

  // Home → Detalle → Inicio del partido → primera pantalla de registro (Gol).
  let opened = false
  for (let i = 0; i < 10 && !opened; i++) {
    await evaluate(`(() => { const a = document.querySelector('article'); if (a) a.click() })()`)
    const detailShown = await waitFor(`document.querySelector('[data-detail-next]') !== null`, 800)
    if (!detailShown) continue
    await evaluate(`(() => { const b = document.querySelector('[data-detail-next]'); if (b) b.click() })()`)
    const startShown = await waitFor(`document.querySelector('[data-start]') !== null`, 800)
    if (!startShown) continue
    ok(await waitFor(`document.querySelector('[data-lineup-next]') === null`, 400), 'árbitro: sin paso de Cargar alineaciones', '')
    ok(await waitFor(`document.querySelector('[data-start-kickoff]') !== null`, 400), 'inicio del partido (árbitro): pitazo inicial presente', '')
    ok(await waitFor(`document.querySelector('[data-start-final-kickoff]') !== null`, 400), 'inicio del partido (árbitro): pitazo final presente', '')
    ok(await waitFor(`document.querySelectorAll('[data-start-extra]').length === 2`, 400), 'inicio del partido (árbitro): 2 tiempos extra por periodo', '')
    ok(await waitFor(`document.querySelectorAll('[data-start-delay]').length === 0`, 400), 'inicio del partido (árbitro): sin Retrasos', '')
    ok(await waitFor(`document.querySelectorAll('[data-start-uniform]').length === 0`, 400), 'inicio del partido (árbitro): sin Similitud de uniformes', '')
    ok(await waitFor(`document.querySelectorAll('[data-start-attendance]').length === 0`, 400), 'inicio del partido (árbitro): sin Asistencia', '')
    await evaluate(`(() => { const b = document.querySelector('[data-start-next]'); if (b) b.click() })()`)
    opened = await waitFor(`document.querySelector('[data-live-section="goal"]') !== null`, 800)
  }
  if (!opened) {
    const diag = await evaluate(`({
      articles: document.querySelectorAll('article').length,
      hasGoal: !!document.querySelector('[data-live-section="goal"]'),
      hasStart: !!document.querySelector('[data-start]'),
      hasSection: !!document.querySelector('[data-live-section]'),
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
      const header = document.querySelector('header')
      const stripScore = document.querySelector('[data-strip-score]')
      const save = document.querySelector('[data-save]')
      const back = !!document.querySelector('[data-live-back]')
      const next = !!document.querySelector('[data-live-next]')
      const headerRect = header ? header.getBoundingClientRect() : null
      const section = document.querySelector('[data-live-section]')?.getAttribute('data-live-section') ?? null
      return {
        vw: innerWidth, vh: innerHeight,
        section,
        stripScore: stripScore ? stripScore.textContent.trim() : null,
        save: save ? save.textContent.trim() : null,
        headerH: headerRect ? Math.round(headerRect.height) : null,
        back,
        next,
      }
    })()`)

    ok(info.section === 'goal', 'pantalla inicial = Registrar gol', info.section ?? '')
    ok(info.save === 'Guardar gol', 'formulario de gol presente (CTA Guardar gol)', info.save ?? '')
    ok(info.stripScore === '0 - 0', 'marcador compacto 0 - 0', info.stripScore ?? '')
    ok(info.headerH != null && info.headerH >= 56, 'cabecera presente', `${info.headerH}px`)
    ok(info.back, 'pantalla muestra Volver', '')
    ok(info.next, 'pantalla muestra Siguiente', '')

    // Alineaciones: botón en la cabecera abre el panel lateral de titulares.
    await evaluate(`(() => { const b = document.querySelector('header button[aria-label="Alineaciones"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-lineup-sidebar]') !== null`, 800), 'Alineaciones abre el panel lateral de titulares')
    await evaluate(`(() => { const x = document.querySelector('[data-lineup-sidebar] button[aria-label="Cerrar alineaciones"]'); if (x) x.click() })()`)
    await waitFor(`document.querySelector('[data-lineup-sidebar]') === null`, 800)

    // Logs: botón en la cabecera abre el sidebar de eventos.
    await evaluate(`(() => { const b = document.querySelector('header button[aria-label="Logs"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-logs-sidebar]') !== null`, 800), 'Logs abre el sidebar de eventos')
    await evaluate(`(() => { const x = document.querySelector('[data-logs-sidebar] button[aria-label="Cerrar logs"]'); if (x) x.click() })()`)
    await waitFor(`document.querySelector('[data-logs-sidebar]') === null`, 800)

    // Pantalla inicial = formulario "Registrar gol" (sin pantalla intermedia).
    const shotGoal = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-goal.png`), Buffer.from(shotGoal.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-goal.png`)

    // Registrar gol: titular local preseleccionado → Guardar gol → 1 - 0.
    await evaluate(`(() => { const save = document.querySelector('[data-save]'); if (save) save.click() })()`)
    ok(await waitFor(`document.querySelector('[data-strip-score]')?.textContent.trim() === '1 - 0'`, 800), 'registrar gol incrementa el marcador a 1 - 0')

    await new Promise((r) => setTimeout(r, 300))
    const shotMain = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}.png`), Buffer.from(shotMain.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}.png`)

    // ── Navegación secuencial: Gol → Cambios → Sanciones → Lesionados → Incidencias. ──
    const expectSection = (id) =>
      waitFor(`document.querySelector('[data-live-section]')?.getAttribute('data-live-section') === '${id}'`, 800)
    const nextStep = () => evaluate(`(() => { const b = document.querySelector('[data-live-next]'); if (b) b.click() })()`)

    // Cambios.
    await nextStep()
    ok(await expectSection('sub'), 'Siguiente lleva a la pantalla Cambios')
    ok(await waitFor(`document.querySelector('[data-live-section="sub"] [data-player-select]') !== null`, 800), 'cambio muestra el formulario de cambio')
    ok(await waitFor(`document.querySelectorAll('[data-live-section="sub"] [data-player-select]').length === 2`, 800), 'cambio muestra jugador que sale e ingresa')
    ok(await waitFor(`document.querySelector('[data-live-section="sub"] [data-player-icon="out"]') !== null`, 800), 'icono de salida (rojo) presente')
    ok(await waitFor(`document.querySelector('[data-live-section="sub"] [data-player-icon="in"]') !== null`, 800), 'icono de ingreso (verde) presente')
    ok(await waitFor(`document.querySelector('[data-live-section="sub"] textarea[data-note]') !== null`, 800), 'cambio muestra Observaciones')
    ok(await waitFor(`document.querySelector('[data-live-section="sub"] button[data-save]')?.textContent.trim() === 'Guardar cambio'`, 800), 'CTA Guardar cambio')
    await evaluate(`(() => { const b = document.querySelector('[data-live-section="sub"] button[data-save]'); if (b) b.click() })()`)

    // Sanciones (tarjeta).
    await nextStep()
    ok(await expectSection('sanction'), 'Siguiente lleva a la pantalla Sanciones')
    ok(await waitFor(`document.querySelectorAll('[data-live-section="sanction"] [data-cardtype]').length === 2`, 800), 'tarjeta muestra 2 tipos (Amarilla/Roja)')
    ok(await waitFor(`document.querySelector('[data-live-section="sanction"] input[data-reason]') !== null`, 800), 'campo Motivo (input) presente')
    ok(await waitFor(`document.querySelector('[data-live-section="sanction"] textarea[data-note]') !== null`, 800), 'campo Observaciones presente')
    await evaluate(`(() => { const b = document.querySelector('[data-live-section="sanction"] button[data-save]'); if (b) b.click() })()`)

    // Lesionados.
    await nextStep()
    ok(await expectSection('injured'), 'Siguiente lleva a la pantalla Lesionados')
    ok(await waitFor(`document.querySelectorAll('[data-live-section="injured"] [data-incident-option]').length === 1`, 800), 'lesión muestra un único tipo')
    ok(await waitFor(`document.querySelector('[data-live-section="injured"] [data-incident-option="injury"][aria-pressed="true"]') !== null`, 800), 'Lesión preseleccionada')
    await evaluate(`(() => { const b = document.querySelector('[data-live-section="injured"] button[data-save]'); if (b) b.click() })()`)

    // Incidencias.
    await nextStep()
    ok(await expectSection('incident'), 'Siguiente lleva a la pantalla Incidencias')
    ok(await waitFor(`document.querySelectorAll('[data-live-section="incident"] [data-incident-option]').length === 4`, 800), 'incidencia muestra 4 tipos')
    ok(await waitFor(`document.querySelector('[data-live-section="incident"] [data-minute]') !== null`, 800), 'registro de evento muestra el campo Minuto')
    ok(await waitFor(`document.querySelector('[data-live-section="incident"] textarea[data-note]') !== null`, 800), 'incidencia muestra Descripción')
    ok(await waitFor(`document.querySelector('[data-live-section="incident"] button[data-save]')?.textContent.trim() === 'Guardar incidencia'`, 800), 'CTA Guardar incidencia')
    await evaluate(`(() => { const b = document.querySelector('[data-live-section="incident"] button[data-save]'); if (b) b.click() })()`)

    // Volver retrocede una pantalla (Incidencias → Lesionados) y Siguiente vuelve a avanzar.
    await evaluate(`(() => { const b = document.querySelector('[data-live-back]'); if (b) b.click() })()`)
    ok(await expectSection('injured'), 'Volver retrocede a la pantalla Lesionados')
    await nextStep()
    ok(await expectSection('incident'), 'Siguiente vuelve a la pantalla Incidencias')

    // ── Siguiente → Acta (primera pantalla). ──
    ok(await waitFor(`document.querySelector('[data-strip-score]') !== null`, 800), 'marcador compacto presente antes del Acta')
    await evaluate(`(() => { const b = document.querySelector('[data-live-next]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-acta]') !== null`, 1000), 'Siguiente abre el Acta (primera pantalla)')
    ok(await waitFor(`document.querySelector('[data-acta-score]') !== null`, 800), 'acta muestra el marcador final')
    ok(await waitFor(`document.querySelector('[data-acta-clear]') !== null`, 800), 'acta muestra el botón Limpiar')
    ok(await waitFor(`document.querySelector('[data-acta-close]') !== null`, 800), 'acta muestra el CTA Cerrar acta del partido')
    ok(await waitFor(`document.querySelector('[data-acta-signature-title]')?.textContent.trim() === 'Firma del Árbitro'`, 800), 'acta (árbitro) pide la firma del árbitro')

    // Cerrar acta → aviso de confirmación (verificar antes de cerrar) → documento oficial.
    await evaluate(`(() => { const b = document.querySelector('[data-acta-close]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-acta-confirm]') !== null`, 800), 'Cerrar acta muestra el aviso de confirmación')
    ok(await waitFor(`document.querySelector('[data-acta-confirm-accept]') !== null`, 800), 'el aviso ofrece Cerrar acta')
    ok(await waitFor(`document.querySelector('[data-acta-confirm-cancel]') !== null`, 800), 'el aviso ofrece Cancelar')
    await evaluate(`(() => { const b = document.querySelector('[data-acta-confirm-accept]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-acta-doc]') !== null`, 1000), 'Confirmar cierre abre el documento')
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

    // Tocar una fila (o "Cambiar") abre el modal con opciones + observación.
    await evaluate(`(() => { const r = document.querySelector('[data-pre-row="lighting"]'); if (r) r.click() })()`)
    ok(await waitFor(`document.querySelector('[data-pre-modal]') !== null`, 800), 'Cambiar abre el modal del ítem', '')
    ok(await waitFor(`document.querySelectorAll('[data-pre-modal] [data-pre-option]').length === 2`, 800), 'modal muestra las opciones del ítem', '')
    ok(await waitFor(`document.querySelector('[data-pre-modal] textarea[data-pre-note]') !== null`, 800), 'modal muestra el textarea de observación', '')

    await evaluate(`(() => { const o = document.querySelector('[data-pre-modal] [data-pre-option="0"]'); if (o) o.click() })()`)
    await evaluate(`document.querySelector('[data-pre-modal] textarea[data-pre-note]').focus()`)
    await send('Input.insertText', { text: 'Probar iluminación' })
    await evaluate(`(() => { const b = document.querySelector('[data-pre-modal] [data-pre-save]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-pre-modal]') === null`, 800), 'Guardar cierra el modal', '')
    ok(await waitFor(`document.querySelector('[data-pre-row="lighting"]')?.textContent.includes('Funciona correctamente')`, 800), 'la opción elegida queda en la fila', '')
    ok(await waitFor(`document.querySelector('[data-pre-row="lighting"] [data-pre-check]') !== null`, 800), 'check verde aparece al guardar', '')
    ok(await waitFor(`document.querySelector('[data-pre-row="lighting"] [data-pre-observation]')?.textContent.includes('Probar iluminación')`, 800), 'la observación queda visible en la fila', '')

    const shotPre = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-pre.png`), Buffer.from(shotPre.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-pre.png`)
  }

  // ── Flujo Comisionado: Cargar alineaciones → Inicio del partido. ──
  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name}-start (${vp.width}x${vp.height}) ===`)
    await openPreMatchChecklist(vp.width, vp.height)
    await evaluate(`(() => { const b = document.querySelector('[data-pre-next]'); if (b) b.click() })()`)
    if (!(await waitFor(`document.querySelector('[data-lineup-next]') !== null`, 1500))) {
      throw new Error('no se abrió Cargar alineaciones (comisario)')
    }

    // Acumula minuto: agregar un jugador muestra el toggle Sí/No y se puede cambiar.
    await evaluate(`(() => { const b = document.querySelector('[data-lineup-add="home-starters"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-lineup-minutes="yes"]') !== null`, 800), 'agregar jugador muestra el toggle Acumula minuto', '')
    ok(await waitFor(`document.querySelector('[data-lineup-minutes="yes"]')?.getAttribute('aria-pressed') === 'true'`, 800), 'Acumula minuto inicia en Sí', '')
    await evaluate(`(() => { const b = document.querySelector('[data-lineup-minutes="no"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-lineup-minutes="no"]')?.getAttribute('aria-pressed') === 'true'`, 800), 'No queda seleccionado al tocarlo', '')

    await evaluate(`(() => { const b = document.querySelector('[data-lineup-next]'); if (b) b.click() })()`)
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
    ok(await waitFor(`document.querySelectorAll('[data-start-uniform]').length === 2`, 800), '2 filas de similitud de uniformes (local/visitante)', '')
    ok(await waitFor(`document.querySelector('[data-start-uniform-detail]') !== null`, 800), 'textarea para detallar la similitud presente', '')
    ok(await waitFor(`document.querySelectorAll('[data-start-attendance]').length === 4`, 800), '4 categorías de asistencia', '')
    ok(await waitFor(`document.querySelector('[data-start-attendance-total]')?.textContent.trim() === '0'`, 800), 'total de asistencia inicia en 0', '')

    const shotStart = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-start.png`), Buffer.from(shotStart.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-start.png`)

    // Cambiar la respuesta "local" a Sí.
    await evaluate(`(() => { const b = document.querySelector('[data-start-delay="local"] [data-start-option="yes"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-start-delay="local"] [data-start-option="yes"]')?.getAttribute('aria-pressed') === 'true'`, 800), 'Sí queda seleccionado al tocar', '')
    ok(await waitFor(`document.querySelector('[data-start-delay="local"] [data-start-option="no"]')?.getAttribute('aria-pressed') === 'false'`, 800), 'No se deselecciona al tocar Sí', '')

    // Al marcar "Sí" se despliega el selector de periodo del retraso (multiselección).
    ok(await waitFor(`document.querySelector('[data-start-delay-period="local"]') !== null`, 800), 'Sí despliega el periodo del retraso', '')
    await evaluate(`(() => { const b = document.querySelector('[data-start-delay-period="local"] [data-start-period-option="first"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-start-delay-period="local"] [data-start-period-option="first"]')?.getAttribute('aria-pressed') === 'true'`, 800), 'Primer tiempo queda seleccionado', '')
    await evaluate(`(() => { const b = document.querySelector('[data-start-delay-period="local"] [data-start-period-option="second"]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-start-delay-period="local"] [data-start-period-option="first"]')?.getAttribute('aria-pressed') === 'true' && document.querySelector('[data-start-delay-period="local"] [data-start-period-option="second"]')?.getAttribute('aria-pressed') === 'true'`, 800), 'ambos periodos pueden seleccionarse a la vez', '')

    // Seleccionar hora de inicio (selector manual, no automático).
    await evaluate(`(() => {
      const el = document.querySelector('[data-start-kickoff]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, '15:30')
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })()`)
    ok(await waitFor(`document.querySelector('[data-start-time]')?.textContent.trim() === '3:30 PM'`, 800), 'seleccionar hora de inicio actualiza la hora (12 h)', '')

    // Seleccionar hora de finalización (selector manual, no automático).
    await evaluate(`(() => {
      const el = document.querySelector('[data-start-final-kickoff]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, '17:45')
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })()`)
    ok(await waitFor(`document.querySelector('[data-start-final-time]')?.textContent.trim() === '5:45 PM'`, 800), 'seleccionar hora de finalización actualiza la hora (12 h)', '')

    // Tiempo extra por periodo: sumar minutos al primer tiempo.
    await evaluate(`(() => { const b = document.querySelector('[data-start-extra="first"] [data-start-extra-plus]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-start-extra="first"] [data-start-extra-value]')?.textContent.includes('1 min')`, 800), 'tiempo extra suma minutos al primer tiempo', '')

    // Asistencia: escribir en "General" actualiza el total.
    await evaluate(`document.querySelector('[data-start-attendance="general"]').focus()`)
    await send('Input.insertText', { text: '1500' })
    ok(await waitFor(`document.querySelector('[data-start-attendance-total]')?.textContent.trim() === '1500'`, 800), 'el total suma la asistencia general', '')

    // Siguiente → primera pantalla de registro (Gol).
    await evaluate(`(() => { const b = document.querySelector('[data-start-next]'); if (b) b.click() })()`)
    ok(await waitFor(`document.querySelector('[data-live-section="goal"]') !== null`, 1200), 'Siguiente abre la pantalla Registrar gol', '')

    // El flujo comisionado muestra Volver + Siguiente (sin Finalizar/Pausar).
    ok(await waitFor(`document.querySelector('[data-live-back]') !== null`, 800), 'el flujo muestra Volver', '')
    ok(await waitFor(`document.querySelector('[data-live-next]') !== null`, 800), 'el flujo muestra Siguiente', '')
    ok(await waitFor(`document.querySelector('[data-finish-half]') === null && document.querySelector('[data-pause-match]') === null`, 400), 'sin Finalizar/Pausar en el flujo comisionado', '')
    ok(await waitFor(`document.querySelector('[data-strip-score]') !== null`, 800), 'comisionado: marcador compacto presente', '')
    ok(await waitFor(`document.querySelector('[data-clock]') === null`, 400), 'comisionado: sin cronómetro', '')

    const shotLive = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.cwd(), 'tools', 'shots', `${vp.name}-live.png`), Buffer.from(shotLive.result.data, 'base64'))
    console.log(`  captura → tools/shots/${vp.name}-live.png`)

    // Recorre las 5 pantallas (Gol → Cambios → Sanciones → Lesionados → Incidencias) → Acta.
    for (let i = 0; i < 5; i++) {
      await evaluate(`(() => { const b = document.querySelector('[data-live-next]'); if (b) b.click() })()`)
    }
    ok(await waitFor(`document.querySelector('[data-acta]') !== null`, 1000), 'Siguiente recorre las 5 pantallas y abre el Acta', '')
    ok(await waitFor(`document.querySelector('[data-acta-signature-title]')?.textContent.trim() === 'Firma del Comisionado'`, 800), 'acta (comisionado) pide la firma del comisionado', '')
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