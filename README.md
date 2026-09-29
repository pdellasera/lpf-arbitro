# LPF — Login (clon fiel)

Clon del login de la app **LPF** (Liga Panameña de Fútbol) construido con
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

## Plataformas soportadas

La app está pensada **solo para móvil y tablet**. En pantallas grandes (≥1024px con
puntero fino — escritorio/portátil con ratón) el login se oculta y se muestra un aviso
(*"Disponible en móviles y tablets"*). El filtro es 100% CSS (sin JS, sin parpadeo):

```css
@media (width >= 64rem) and (pointer: fine) { /* login oculto, aviso visible */ }
```

Los tablets táctiles (incluido iPad en horizontal) **siempre** ven el login.

## Estructura

```
src/
├─ assets/                      login_background.webp, shield.webp (generados)
├─ components/ui/               TextField, PrimaryButton, SecondaryButton,
│                               Toggle, Divider, LpfLogo, VersionTag
├─ features/auth/
│  ├─ api/authApi.ts            login() + fetchAppVersion() (mock + real via VITE_API_URL)
│  ├─ hooks/                    useLogin, useAppVersion (React Query)
│  ├─ components/               LoginScreen, AuthHeader, LoginCard, RememberRow,
│  │                            DesktopNotice (aviso de escritorio)
│  └─ types.ts
├─ lib/                         queryClient.ts, cn.ts
└─ index.css                    tokens Tailwind v4 (@theme)
tools/                          prepare-assets.ps1, measure-*.ps1 (análisis),
                                smoke-test.mjs, verify-css.ps1, extract-css.ps1
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
- `tools/measure-*.ps1` son scripts de análisis por píxeles usados para extraer las medidas;
  no forman parte de la app.
- Comportamiento móvil: `100dvh` (altura dinámica), safe areas (`env(safe-area-inset-*)`),
  `overscroll-behavior: none`, `touch-action: manipulation`, inputs ≥16px (evita el zoom de
  iOS al enfocar) y `interactive-widget=resizes-content` (el teclado no tapa el botón).
