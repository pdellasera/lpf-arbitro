import {
  Crosshair,
  Flag,
  Hand,
  Maximize2,
  Pause,
  Play,
  Repeat2,
  Volleyball,
} from 'lucide-react'
import type { EventKind, LiveMatch, MatchPhase } from '../types'

/** mapeo minuto -> px de lienzo (dos escalas medidas: 1T y 2T). */
function minuteToX(minute: number): number {
  if (minute <= 45) return 28 + minute * 9.22
  return 532 + (minute - 46) * 11.714
}

const TRACK_W = 1148
const pct = (px: number) => `${(px / TRACK_W) * 100}%`

/** Ajusta el minuto a la escala visible según la fase (1T: 0-45, 2T: 46-90). */
function clampMinute(minute: number, phase: MatchPhase): number {
  if (phase === 'second' || phase === 'ended') return Math.min(Math.max(minute, 46), 90)
  return Math.min(minute, 45)
}

function EventGlyph({ kind, side }: { kind: EventKind; side: string }) {
  switch (kind) {
    case 'goal':
      return <Volleyball className="h-4 w-4 text-white" />
    case 'yellow':
      return <span className="h-3.5 w-2.5 rounded-[2px] bg-[#dcb90a]" />
    case 'red':
      return <span className="h-3.5 w-2.5 rounded-[2px] bg-[#e5484d]" />
    case 'sub':
      return <Repeat2 className="h-4 w-4 text-[#00c258]" />
    case 'corner':
      return <Flag className="h-4 w-4 text-white" />
    case 'foul':
      return <Crosshair className="h-4 w-4 text-white" />
    case 'freekick':
      return <Hand className="h-4 w-4 text-white" />
    default:
      return (
        <span
          className="h-3 w-3 rounded-[3px]"
          style={{ background: side === 'neutral' ? '#6c1be7' : '#c8ccd6' }}
        />
      )
  }
}

interface MatchTimelineProps {
  match: LiveMatch
  minute: number
  running: boolean
  onTogglePlay: () => void
}

const TICKS = [0, 15, 30, 45, 46, 60, 75, 90]

export function MatchTimeline({ match, minute, running, onTogglePlay }: MatchTimelineProps) {
  const phase = match.phase
  const events = match.events
  const displayMinute = clampMinute(minute, phase)
  const canToggle = phase === 'first' || phase === 'second'

  const byMinute = new Map<number, typeof events>()
  for (const ev of events) {
    const m = clampMinute(ev.minute, phase)
    const list = byMinute.get(m) ?? []
    list.push(ev)
    byMinute.set(m, list)
  }

  const firstAdded = match.periods.find((p) => p.half === 1)?.addedSeconds ?? 0
  const secondAdded = match.periods.find((p) => p.half === 2)?.addedSeconds ?? 0

  return (
    <div className="relative h-full w-full overflow-hidden rounded-t-2xl bg-[#071423]/95">
      {/* play/pause */}
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={!canToggle}
        aria-label={running ? 'Pausar' : 'Reanudar'}
        className={`absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#0076f4] text-[#0076f4] transition-opacity ${
          canToggle ? '' : 'opacity-40'
        }`}
        style={{ width: 'clamp(40px, 6.6dvh, 54px)', height: 'clamp(40px, 6.6dvh, 54px)' }}
      >
        {running ? (
          <Pause className="h-[clamp(16px,2.4dvh,22px)] w-[clamp(16px,2.4dvh,22px)]" />
        ) : (
          <Play className="h-[clamp(16px,2.4dvh,22px)] w-[clamp(16px,2.4dvh,22px)]" fill="currentColor" />
        )}
      </button>

      {/* etiquetas 1T / 2T + añadido */}
      <span className="absolute left-16 top-[14%] text-xs font-semibold text-white/60">
        1T{firstAdded > 0 ? ` +${Math.round(firstAdded / 60)}'` : ''}
      </span>
      <span className="absolute top-[14%] text-xs font-semibold text-white/60" style={{ left: pct(548) }}>
        2T{secondAdded > 0 ? ` +${Math.round(secondAdded / 60)}'` : ''}
      </span>

      {/* pista */}
      <div
        className="absolute h-[2px] rounded-full bg-[#607793]"
        style={{ left: pct(96), top: '54%', width: pct(1044) }}
      />

      {/* marcas (ticks) sobre la pista */}
      {TICKS.map((m) => (
        <span
          key={m}
          className="absolute w-px -translate-x-1/2 bg-[#607793]"
          style={{ left: pct(minuteToX(m)), top: '51%', height: '6%' }}
        />
      ))}

      {/* separador 45'/46' */}
      <span
        className="absolute top-[30%] w-px bg-[#3a4d63]"
        style={{ left: pct(487), height: '34%' }}
      />

      {/* eventos */}
      {[...byMinute.entries()].map(([m, evs]) => (
        <div
          key={m}
          className="absolute flex -translate-x-1/2 items-center justify-center gap-0.5"
          style={{ left: pct(minuteToX(m)), top: '34%' }}
        >
          {evs.map((ev) => (
            <EventGlyph key={ev.id} kind={ev.kind} side={ev.side} />
          ))}
        </div>
      ))}

      {/* ticks numéricos */}
      {TICKS.map((m) => (
        <span
          key={m}
          className="absolute -translate-x-1/2 text-[11px] font-semibold tabular-nums text-[#b8c8dd]"
          style={{ left: pct(minuteToX(m)), top: '62%' }}
        >
          {m}&#39;
        </span>
      ))}

      {/* minuto actual */}
      <div
        className="absolute w-[2px] rounded-full bg-[#0b63f6]"
        style={{ left: pct(minuteToX(displayMinute)), top: '12%', height: '38%', transform: 'translateX(-50%)' }}
      />
      <span
        className="absolute -translate-x-1/2 text-sm font-bold tabular-nums text-white"
        style={{ left: pct(minuteToX(displayMinute)), top: '0%' }}
      >
        {displayMinute}&#39;
      </span>

      {/* maximizar */}
      <button
        type="button"
        aria-label="Pantalla completa"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white/70"
      >
        <Maximize2 className="h-5 w-5" />
      </button>
    </div>
  )
}
