# LPF Árbitro — Informe digital del árbitro (PWA)

PWA instalable de la **Liga Panameña de Fútbol** para el informe digital del árbitro:
login, listado de partidos del día (**Home**) e informe en vivo con tablero de cancha
y registro de eventos (**Partido en vivo**). Construida con
**React 19 + Vite + TypeScript + TailwindCSS v4 + framer-motion + React Query + lucide-react**.

La UI se reconstruyó a partir de análisis de píxeles de los assets del mockup
(`assets/login_screem.png` = referencia visual, `assets/login_background.png` = fondo limpio,
`assets/logo.png` = lockup del logo). El diseño de referencia es **941×1672** (escala **2x**),
por lo que los valores en CSS son la mitad de los medidos.

## Requisitos

- Node.js ≥ 20
- npm ≥ 10

## Puesta en marcha

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compila (tsc + vite)
npm run preview    # sirve el build de producción
```

## Deploy (Vercel)

La app está lista para desplegar en Vercel como sitio estático (preset **Vite**):

- **Repositorio:** https://github.com/pdellasera/lpf-arbitro.git
- **Build command:** `npm run build` (ejecuta `tsc --noEmit` + `vite build`)
- **Output directory:** `dist`
- **Production branch:** `main`
- **Framework preset:** Vite (se autodetecta; `vercel.json` lo fija explícitamente)
- **Node.js Version:** 22.x (Settings → Node.js Version)

Configuración de caché en `vercel.json`: `/sw.js` y `/manifest.webmanifest` se sirven con
`Cache-Control: public, max-age=0, must-revalidate` (para que el service worker y el manifest
se actualicen al instante), `/assets/*` con `immutable` (los archivos de Vite llevan hash)
y `/icons/*` con caché de 7 días.

Variables de entorno (opcionales):

| Variable | Valor | Efecto |
|---|---|---|
| `VITE_API_URL` | (vacío) | Usa el mock local de login/partidos. Poné la URL del backend real para activarlo. |
| `VITE_PWA_NO_DEV_SW` | `1` | Solo relevante en desarrollo (`vite dev`), no en producción. |

> ⚠️ **Gotchas:** no definas `NODE_ENV=production` como variable de entorno (npm omitiría
> `devDependencies` y el build fallaría por falta de `tsc`/`vite`), y no fuerces
> `installCommand: "npm ci"` (el default `npm install` es más robusto).

Verificación tras el deploy:

```bash
curl -sI https://<proyecto>.vercel.app/sw.js                 # Cache-Control: must-revalidate
curl -sI https://<proyecto>.vercel.app/manifest.webmanifest   # application/manifest+json
curl -sI https://<proyecto>.vercel.app/assets/index-*.js      # immutable
```

En Android, abrí la URL y confirmá que aparece **"Instalar ahora"**; `?pwa=debug` muestra
el estado del service worker, el manifest y el evento `beforeinstallprompt`.

## Plataformas soportadas

La app está pensada **solo para móvil y tablet**. En pantallas grandes (≥1024px con
puntero fino — escritorio/portátil con ratón) el login se oculta y se muestra un aviso
(*"Disponible en móviles y tablets"*). El filtro es 100% CSS (sin JS, sin parpadeo):

```css
@media (width >= 64rem) and (pointer: fine) { /* login oculto, aviso visible */ }
```

Los tablets táctiles (incluido iPad en horizontal) **siempre** ven el login.

## PWA — instalación antes de usar

La app es instalable (PWA). Al abrir el **Login** se muestra un **modal** de instalación:

> *Para que el sistema funcione correctamente es necesario instalar la aplicación.*

- **Android / Chrome / Edge** (evento `beforeinstallprompt` disponible): el modal muestra
  el botón **"Instalar ahora"**, que abre el instalador nativo del sistema.
- En Android, si el prompt nativo aún no está listo, el botón reintenta al pulsarlo y, si
  sigue sin estar disponible, explica el motivo (contexto no seguro, service worker ausente
  o navegador sin soporte) y muestra los pasos manuales.
- **iOS / iPadOS Safari** (y navegadores sin `beforeinstallprompt`): el modal muestra los
  **pasos manuales** (Compartir → "Añadir a pantalla de inicio" → Añadir).
- **"Más tarde"** (o X / Escape / clic fuera) cierra el modal y deja el Login usable.
  El recordatorio **no se recuerda**: el modal vuelve a aparecer en cada apertura hasta
  que la app esté instalada.
- Una vez instalada (`display-mode: standalone` o evento `appinstalled`) el modal no
  vuelve a mostrarse.

### Cómo funciona

| Pieza | Ubicación |
|---|---|
| Manifest | `public/manifest.webmanifest` (`display: standalone`, `orientation: any`, `#04121f`) |
| Service worker | `public/sw.js` (network-first para navegación, cache-first para assets/fuentes, sin cachear `/api`) |
| Iconos | `public/icons/*` (generados con `tools/prepare-pwa-icons.ps1`) |
| Registro del SW | `src/features/pwa/lib/registerServiceWorker.ts` (`/sw.js` en producción, `/sw-dev.js` en desarrollo) |
| SW de desarrollo | `public/sw-dev.js` (passthrough, sin caché; solo para probar la instalación en `vite dev`) |
| Detección / estado | `src/features/pwa/{lib/installState.ts, hooks/usePwaInstall.ts}` |
| Modal + instrucciones | `src/features/pwa/components/{InstallModal, InstallInstructions}.tsx` |

### Requisitos para probar la instalación

- El service worker y `beforeinstallprompt` exigen **HTTPS o `localhost`**.
- En producción se registra `sw.js`; en desarrollo se registra `sw-dev.js` (passthrough,
  sin caché) para poder probar el instalador en `localhost:5173` sin romper HMR.
  `VITE_PWA_NO_DEV_SW=1` desactiva el SW de desarrollo si necesitas el comportamiento antiguo.
- `beforeinstallprompt` es **solo de Chromium** (Chrome/Edge). Safari y Firefox nunca lo
  disparan → se muestran instrucciones manuales.
- Inspección en Chrome: DevTools → Application → Manifest / Service Workers.

#### ¿Por qué NO instala desde la IP de la LAN?

`http://192.168.x.x` **no es un contexto seguro** para Chrome: `isSecureContext` es `false`,
`navigator.serviceWorker` ni siquiera existe y `beforeinstallprompt` queda bloqueado (Chrome
tampoco puede generar el WebAPK de un origen inseguro). **Ningún cambio de código lo arregla.**

Para probar la instalación desde el móvil usa una de estas vías:

| Vía | URL en el móvil | ¿Requiere código? |
|---|---|---|
| Port forwarding USB (`chrome://inspect`) | `http://localhost:5173` o `:4173` | no |
| Túnel HTTPS al preview | `https://…trycloudflare.com` (cloudflared) | no |
| Túnel HTTPS al dev | `https://…trycloudflare.com` → `localhost:5173` | SW de dev (incluido) |
| Flag de origen inseguro en el móvil | `http://192.168.x.x:5173` + `#unsafely-treat-insecure-origin-as-secure` | SW de dev (incluido) |

#### Diagnóstico sin DevTools: `?pwa=debug`

Añade `?pwa=debug` a la URL (en dev o en producción) y verás un panel con `origin`,
`isSecureContext`, estado del service worker, manifest, plataforma y si `beforeinstallprompt`
llegó (y cuándo). Es la forma más rápida de saber cuál de los requisitos te está frenando.

En `vite dev` (o con `?pwa=debug`) también aparece en el login el botón
**"Debug · Borrar caché y reinstalar"**: desregistra el service worker, vacía las cachés y
limpia `localStorage`/`sessionStorage` (incluida la bandera `lpf-pwa-installed`) y recarga,
para desbloquear la instalación desde cero.

#### Probar el instalador nativo en un Android real

1. `npm run build && npm run preview` (deja el build servido en `http://localhost:4173`).
2. En el PC abre `chrome://inspect/#devices` → **Port forwarding** → añade `4173` →
   `localhost:4173` y conecta el móvil por USB (con depuración USB activada).
3. En el móvil abre `http://localhost:4173`. Al ser `localhost`, es contexto seguro: el
   service worker se registra y Chrome emite `beforeinstallprompt` → el modal muestra
   **"Instalar ahora"** y abre el instalador nativo.

> ⚠️ No uses `npm run preview --host` con la IP de la red local
> (`http://192.168.x.x:4173`): **no** es contexto seguro y el instalador no aparecerá.
> Como alternativa al USB sirve un túnel HTTPS
> (`npx cloudflared tunnel --url http://localhost:4173`).

#### Si el botón no abre el instalador

- **Cooldown de Chrome**: si ya descartaste el prompt nativo antes, Chrome deja de emitir
  `beforeinstallprompt` una temporada. Borra los datos del origen (Ajustes → Configuración
  de sitios) y activa `chrome://flags/#bypass-app-banner-engagement-checks`. Evita el modo
  incógnito (nunca emite el evento).
- **Origen no seguro** (IP de LAN): ver la sección anterior; usa port forwarding o túnel HTTPS.
- **Sin service worker activo**: en producción usa `npm run preview`; en desarrollo confirma
  con `?pwa=debug` que `sw-dev.js` está `active`.
- **Firefox Android**: no emite `beforeinstallprompt` → instrucciones manuales (menú ⋮).

Para regenerar los iconos tras cambiar el logo:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File tools\prepare-pwa-icons.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-pwa.ps1
```

## Estructura

```
src/
├─ assets/                      login_background.webp, shield.webp (generados)
│  ├─ crests/                    escudos de los clubes (cai, tauro, umecit, ...)
│  ├─ live/                      crowd-top, crowd-side (fondo del partido en vivo)
│  └─ players/                   p1..p4 (avatares de jugadores)
├─ components/ui/               TextField, PrimaryButton, SecondaryButton,
│                               Toggle, Divider, LpfLogo, VersionTag,
│                               Crest, IconButton, PlayerAvatar
├─ features/auth/
│  ├─ api/authApi.ts            login() + fetchAppVersion() (mock + real via VITE_API_URL)
│  ├─ hooks/                    useLogin, useAppVersion (React Query)
│  ├─ components/               LoginScreen, AuthHeader, LoginCard, RememberRow,
│  │                            DesktopNotice (aviso de escritorio)
│  ├─ session.ts / SessionProvider.tsx   estado de sesión (localStorage)
│  └─ types.ts
├─ features/matches/            HomeScreen, MatchCard, BottomNav, DaySelector,
│                               useMatches, mockMatches (listado del día)
├─ features/match-control/      LiveMatchScreen, PitchBoard, MatchTimeline,
│                               EventDrawer, useLiveMatchState (informe en vivo)
├─ features/pwa/                registerServiceWorker, installState, usePwaInstall,
│                               InstallModal, InstallInstructions, PwaDebugPanel
├─ lib/                         queryClient.ts, cn.ts
└─ index.css                    tokens Tailwind v4 (@theme)
tools/                          Generadores: prepare-assets.ps1, prepare-pwa-icons.ps1,
                                prepare-crests.ps1, prepare-live-assets.ps1
                                Verificación: smoke-test.mjs, verify-pwa.ps1,
                                verify-css.ps1, verify-live-css.ps1
tools/legacy/                   measure-*.ps1, read-*.ps1, ocr-home.ps1 (análisis del mockup)
```

## Paleta (medida del mockup)

| Token | Valor |
|---|---|
| Primario / botón | `#0062FD` |
| Hover botón | `#1a74ff` |
| Gradiente tarjeta | `#1e314a → #081a2c` |
| Fondo input | `#122238` |
| Texto atenuado | `#8ca0b5` |
| Link | `#6fa6ff` |
| Icono secundario | `#3c84e8` |

## Credenciales demo (mock)

- Correo: `arbitro@lpf.com`
- Contraseña: `123456`

Para conectar un backend real, define `VITE_API_URL` (ver `.env.example`).

## Notas / asunciones

- El `logo.png` es un *lockup* (escudo + wordmark). Se recortó solo el **escudo**
  (`tools/prepare-assets.ps1` → `src/assets/shield.webp`), que es lo que muestra el mockup.
- La barra de estado iOS (9:41) es parte del mockup, no de la app web; se omite.
- La tipografía usada es **Inter** (no se pudo identificar la fuente exacta del mockup).
- Los textos del formulario se asumen a partir del contexto (ver abajo). Si difieren del
  mockup real, se cambian en `LoginCard.tsx` / `AuthHeader.tsx`.
- `tools/legacy/measure-*.ps1` (y `read-*.ps1`, `ocr-home.ps1`) son scripts de análisis por
  píxeles usados para extraer las medidas del mockup; no forman parte de la app y se
  conservan solo como referencia.
- Comportamiento móvil: `100dvh` (altura dinámica), safe areas (`env(safe-area-inset-*)`),
  `overscroll-behavior: none`, `touch-action: manipulation`, inputs ≥16px (evita el zoom de
  iOS al enfocar) y `interactive-widget=resizes-content` (el teclado no tapa el botón).

## Partido en vivo — escena a sangre + UI flotante

El tablero de cancha (`PitchBoard.tsx`) ahora es una **capa de fondo a pantalla
completa** (`absolute inset-0`): el césped a rayas cubre los **4 bordes** del viewport
(no hay bandas oscuras) y las tribunas (`crowd-top`/`crowd-side`) ocupan exactamente el
letterbox que deja el campo. El campo conserva la relación de aspecto del diseño
**976×560** (césped 950×560 + portería de 26px) y se centra con:

```css
.pitch-stage { container-type: size; }        /* escenario = contenedor de consulta */
.pitch-stage {
  --pitch-w: min(100cqw, calc(100cqh * 1.742857));
  --pitch-h: min(100cqh, calc(100cqw / 1.742857));
  --band-x: calc((100cqw - var(--pitch-w)) / 2);   /* tribuna lateral */
  --band-y: calc((100cqh - var(--pitch-h)) / 2);   /* tribuna sup/inf */
}
.pitch-box { width: var(--pitch-w); aspect-ratio: 976 / 560; }
```

de modo que el SVG de marcas (`viewBox="-26 0 976 560"`) se estira 1:1 y **no se
deforma** en ningún viewport. Todo lo demás **flota** sobre la escena, compacto y con
fondo translúcido + `backdrop-blur`:

- **Header** (`absolute inset-x-2`, alto `--live-header-h = clamp(44px,9.4dvh,76px)`)
  con Volver / marcador / acciones rápidas.
- **Rail de acciones** (`absolute left`, centrado entre header y timeline): 1 columna en
  tablet, **2×4 en `short`**.
- **Timeline** (`absolute inset-x-2 bottom`, alto `--live-timeline-h = clamp(56px,13dvh,110px)`).
- **Panel de evento** (`absolute right`, tarjeta redondeada, no pegado al borde).

- **Variante `short`** (`@media (max-height: 560px)`, declarada con `@custom-variant` en
  `index.css`): en móvil horizontal el rail pasa a **2 columnas × 4 filas** con botones
  "icono + etiqueta diminuta" e iconos reducidos, para que las 8 acciones + los botones
  de fase quepan sin scroll; en tablet/PC el rail es de **1 columna** con etiqueta al lado.
- **Etiquetas de jugador**: se escalan con `cqw` (ancho real del campo) y se ocultan —salvo
  la del jugador seleccionado— cuando el campo mide <760px, vía
  `@container (max-width: 760px)` y `data-selected`. Así los nombres no tapan la cancha en
  el móvil.
- **Marcadores** (`PlayerMarker.tsx`): el punto/número usa `clamp(20px, 2.9cqw, 28px)` y la
  etiqueta `clamp(9px, 1.15cqw, 11px)`, de modo que todo escala con el campo.

Verificación: `tools/verify-live-css.ps1` audita los tokens de layout en `src` y en el CSS
compilado (`dist`). `tools/layout-check.mjs` abre el partido en Chrome headless a
640×320 / 800×360 / 1024×768 / 1524×820, valida que la escena y el césped cubren el
viewport, el AR y que las 8 acciones caben en el rail flotante sin scroll ni
solapamientos, y guarda capturas en `tools/shots/` (requiere Chrome y
`node --experimental-websocket`).
