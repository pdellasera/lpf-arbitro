import { useState, type ReactNode } from 'react'
import { ArrowLeft, Check, FileDown, House, X } from 'lucide-react'
import lpfInk from '@/assets/lpf-ink.webp'
import type { Match } from '@/features/matches/types'
import type { LiveMatch } from '../../types'
import { formatShortDate, goalsBySide, halfTimeScore, type GoalRecord } from '../../lib/acta'

/** Datos de demostración sin fuente en el modelo (ver README §Acta de finalización). */
const GAME_NUMBER = '184'
const ASESOR = '—'
const COMISARIO = 'Luis Magallón'

const PENALTY_HOME = { numbers: ['10', '11', '7', '9', '8'], results: ['x', '0', 'x', '0', '0'] }
const PENALTY_AWAY = { numbers: ['10', '9', '8', '11', '7'], results: ['0', 'x', '0', '0', '0'] }

const SUBS_HOME = [
  { min: '46', outNo: '7', out: 'Juan Pérez', inNo: '15', in: 'Mateo Silva' },
  { min: '62', outNo: '10', out: 'Carlos Ruiz', inNo: '16', in: 'Luis Herrera' },
  { min: '80', outNo: '11', out: 'Andrés Mendoza', inNo: '18', in: 'Samuel Cruz' },
]

const SUBS_AWAY = [
  { min: '46', outNo: '8', out: 'Diego Sánchez', inNo: '14', in: 'Jorge Castillo' },
  { min: '66', outNo: '10', out: 'David Rojas', inNo: '17', in: 'Pablo Ríos' },
  { min: '82', outNo: '11', out: 'Matías Fernández', inNo: '18', in: 'Carlos León' },
]

const INCIDENTS = [
  { minute: 32, text: 'Detención del juego por lesión de #5 Marcos Ortega (CAI).' },
  { minute: 67, text: 'Pausa por lluvia (3 minutos).' },
  { minute: 78, text: 'Amonestación a #10 David Rojas (San Francisco) por conducta antideportiva.' },
]

const MAX_GOAL_ROWS = 5
const MAX_INCIDENT_ROWS = 7

interface ActaDocumentScreenProps {
  match: Match
  live: LiveMatch
  onBack: () => void
  onHome: () => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-2 py-1">
      <span className="text-[11px] font-bold text-ink">{label}: </span>
      <span className="text-[11px] text-ink">{value}</span>
    </div>
  )
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap">{children}</div>
}

function GridTable({
  cols,
  head,
  rows,
  firstBold = false,
}: {
  cols: string
  head?: string[]
  rows: string[][]
  firstBold?: boolean
}) {
  const base =
    'flex items-center justify-center border-b border-r border-ink/70 px-1 py-[3px] text-[11px] leading-tight text-ink'
  const bold = `${base} font-bold`
  return (
    <div className={`grid ${cols} border-l border-t border-ink/70`}>
      {head?.map((h, i) => (
        <div key={`h${i}`} className={bold}>
          {h}
        </div>
      ))}
      {rows.map((r, ri) =>
        r.map((c, ci) => (
          <div key={`${ri}-${ci}`} className={firstBold && ci === 0 ? bold : base}>
            {c}
          </div>
        )),
      )}
    </div>
  )
}

function goalRows(goals: GoalRecord[]): string[][] {
  const rows = goals.map((g) => [
    g.number ? String(g.number) : '',
    g.name,
    g.penalty ? 'x' : '',
    '',
    String(g.minute),
  ])
  while (rows.length < MAX_GOAL_ROWS) rows.push(['', '', '', '', ''])
  return rows
}

/** Documento oficial "INFORME DEL ÁRBITRO" (clon del mockup federativo) con Cancelar / PDF. */
export function ActaDocumentScreen({ match, live, onBack, onHome }: ActaDocumentScreenProps) {
  const [bannerVisible, setBannerVisible] = useState(true)

  const halfTime = halfTimeScore(live.events)
  const shortDate = match.date ? formatShortDate(match.date) : ''

  const referees = match.referees ?? []
  const referee = (role: string) => referees.find((r) => r.role === role)?.name ?? '—'
  const arbitro = referee('Árbitro central')
  const asistente1 = referee('Asistente 1')
  const asistente2 = referee('Asistente 2')
  const cuarto = referee('Cuarto árbitro')

  const winner =
    live.score.home > live.score.away
      ? live.home.name
      : live.score.away > live.score.home
        ? live.away.name
        : 'Empate'
  const halfTimeWinner =
    halfTime.home === halfTime.away ? 'Empate' : halfTime.home > halfTime.away ? live.home.name : live.away.name

  const homeGoals = goalsBySide(live.events, live.players, 'home')
  const awayGoals = goalsBySide(live.events, live.players, 'away')

  return (
    <div
      data-acta-doc
      className="acta-print-root app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom"
    >
      <header className="no-print sticky top-0 z-30 shrink-0 bg-gradient-to-b from-header-top to-header-bottom">
        <div className="relative flex items-center px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="mr-2 -ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-[19px] font-bold leading-none tracking-tight text-white">Acta de finalización</h1>
        </div>
      </header>

      <main className="acta-print-main flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white">
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
          {bannerVisible && (
            <div data-acta-banner className="mb-4 flex items-start gap-3 rounded-2xl bg-accent-green-soft p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-green">
                <Check className="h-6 w-6 text-white" />
              </span>
              <p className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-[#0b5c38]">
                Informe enviado a la LPF. Las sanciones por acumulación ya se aplicaron automáticamente. Así queda el
                PDF oficial:
              </p>
              <button
                type="button"
                onClick={() => setBannerVisible(false)}
                aria-label="Cerrar aviso"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-mute transition-transform active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Documento oficial (formato federativo) */}
          <section className="acta-sheet rounded-lg border border-ink/30 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
            {/* Encabezado: LPF + título + escudo de la federación */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <img src={lpfInk} alt="LPF" draggable={false} className="h-11 w-auto select-none" />
                <div className="text-[9px] font-bold uppercase leading-[1.15] text-ink">
                  <div className="text-[13px] font-extrabold leading-none">LIGA</div>
                  <div>Panameña</div>
                  <div>de Fútbol</div>
                </div>
              </div>
              <h2 className="flex-1 px-1 text-center text-[15px] font-extrabold uppercase leading-tight text-ink">
                Informe del árbitro
              </h2>
              {/* Escudo de la federación (placeholder hasta disponer del asset oficial). */}
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-ink/50 text-center">
                <span className="text-[7px] font-extrabold uppercase leading-none tracking-wide text-ink">FEPAFUT</span>
                <span className="mt-0.5 text-[6px] uppercase leading-none text-ink/60">Panamá</span>
              </div>
            </div>

            {/* Identificación, equipos y datos del partido */}
            <div className="mt-2 divide-y divide-ink/70 border-t border-ink/70">
              <div className="flex">
                <div className="flex-1 px-2 py-1.5">
                  <span className="text-[11px] font-bold text-ink">NÚMERO DE JUEGO</span>
                  <span className="ml-2 inline-flex h-5 min-w-[38px] items-center justify-center border border-ink/70 px-1.5 text-[11px] font-bold text-ink">
                    {GAME_NUMBER}
                  </span>
                </div>
                <div className="flex-1 px-2 py-1.5">
                  <span className="text-[11px] font-bold text-ink">JORNADA N°</span>
                  <span className="ml-2 inline-flex h-5 min-w-[38px] items-center justify-center border border-ink/70 px-1.5 text-[11px] font-bold text-ink">
                    {match.jornada}
                  </span>
                </div>
              </div>

              <div className="flex">
                <Field label="EQUIPO A" value={live.home.name} />
                <Field label="EQUIPO B" value={live.away.name} />
              </div>

              <FieldRow>
                <Field label="Jugado en" value={match.venue} />
                <Field label="Fecha" value={shortDate} />
              </FieldRow>
              <FieldRow>
                <Field label="Estadio" value={match.venue} />
                <Field label="Hora" value={match.trailing} />
              </FieldRow>
              <FieldRow>
                <Field label="Resultado" value={`${live.score.home} - ${live.score.away}`} />
                <Field label="A favor de" value={winner} />
              </FieldRow>
              <FieldRow>
                <Field label="Resultado Medio Tiempo" value={`${halfTime.home} - ${halfTime.away}`} />
                <Field label="A favor de" value={halfTimeWinner} />
              </FieldRow>
              <FieldRow>
                <Field label="Árbitro" value={arbitro} />
                <Field label="Asistente N° 1" value={asistente1} />
                <Field label="Asistente N° 2" value={asistente2} />
              </FieldRow>
              <FieldRow>
                <Field label="Cuarto Árbitro" value={cuarto} />
                <Field label="Asesor" value={ASESOR} />
                <Field label="Comisario" value={COMISARIO} />
              </FieldRow>
            </div>

            {/* Goles */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { title: 'Equipo A', goals: homeGoals },
                { title: 'Equipo B', goals: awayGoals },
              ].map((g) => (
                <div key={g.title}>
                  <div className="text-center text-[11px] font-extrabold uppercase leading-tight text-ink">{g.title}</div>
                  <div className="text-center text-[11px] font-extrabold uppercase leading-tight text-ink">Goles</div>
                  <div className="mt-1">
                    <GridTable
                      cols="grid-cols-[26px_1fr_20px_20px_30px]"
                      head={['N°', 'JUGADOR', 'P', 'AG', 'Min']}
                      rows={goalRows(g.goals)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tiros desde el punto penal */}
            <div className="mt-3">
              <div className="text-[11px] font-bold text-ink">
                Tiros desde el punto penal <span className="font-normal">x=Gol / 0=no anota</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <GridTable
                  cols="grid-cols-[30px_repeat(5,1fr)]"
                  rows={[['N°', ...PENALTY_HOME.numbers], ['x/0', ...PENALTY_HOME.results]]}
                  firstBold
                />
                <GridTable
                  cols="grid-cols-[30px_repeat(5,1fr)]"
                  rows={[['N°', ...PENALTY_AWAY.numbers], ['x/0', ...PENALTY_AWAY.results]]}
                  firstBold
                />
              </div>
            </div>

            {/* Sustituciones */}
            <div className="mt-3">
              <div className="text-center text-[11px] font-extrabold uppercase text-ink">Sustituciones</div>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <GridTable
                  cols="grid-cols-[28px_26px_1fr_26px_1fr]"
                  head={['Min', 'N°', 'Jugador-Sale', 'N°', 'Jugador-Entra']}
                  rows={SUBS_HOME.map((s) => [s.min, s.outNo, s.out, s.inNo, s.in])}
                />
                <GridTable
                  cols="grid-cols-[28px_26px_1fr_26px_1fr]"
                  head={['Min', 'N°', 'Jugador-Sale', 'N°', 'Jugador-Entra']}
                  rows={SUBS_AWAY.map((s) => [s.min, s.outNo, s.out, s.inNo, s.in])}
                />
              </div>
            </div>

            {/* Incidentes del partido */}
            <div className="mt-3">
              <div className="text-[11px] font-bold text-ink">Incidentes del partido:</div>
              <div className="mt-1">
                {INCIDENTS.map((inc) => (
                  <div
                    key={inc.minute}
                    className="flex gap-2 border-t border-ink/70 px-1 py-1 text-[11px] leading-snug text-ink"
                  >
                    <span className="w-7 shrink-0 text-right font-bold tabular-nums">{inc.minute}&#39;</span>
                    <span className="min-w-0 flex-1">{inc.text}</span>
                  </div>
                ))}
                {Array.from({ length: MAX_INCIDENT_ROWS - INCIDENTS.length }).map((_, i) => (
                  <div key={`e${i}`} className="h-[22px] border-t border-ink/70" />
                ))}
              </div>
            </div>

            {/* Pie de página */}
            <div className="mt-3 text-center text-[11px] font-bold text-ink">Página 1</div>
          </section>
        </div>

        {/* Barra inferior (se oculta al imprimir) */}
        <div className="no-print sticky bottom-0 shrink-0 border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex gap-3">
            <button
              type="button"
              data-acta-home
              onClick={onHome}
              className="flex h-[56px] flex-[1.1] items-center justify-center gap-2 rounded-2xl border border-line bg-white text-[15px] font-bold text-brand transition-all duration-150 hover:border-tint-line hover:bg-tint active:scale-[0.97]"
            >
              <House className="h-5 w-5" />
              Volver inicio
            </button>
            <button
              type="button"
              data-acta-pdf
              onClick={() => window.print()}
              className="flex h-[56px] flex-[1.9] items-center justify-center gap-2 rounded-2xl bg-brand text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(0,98,253,0.32)] transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              <FileDown className="h-5 w-5" />
              Guardar y descargar PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}



