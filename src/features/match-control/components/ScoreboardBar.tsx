import type { LiveMatch, MatchPhase } from '../types'

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function phaseLabel(phase: MatchPhase): string {
  switch (phase) {
    case 'pre':
      return 'Por iniciar'
    case 'first':
      return '1T'
    case 'break':
      return 'Entretiempo'
    case 'second':
      return '2T'
    case 'ended':
      return 'Finalizado'
  }
}

interface ScoreboardBarProps {
  match: LiveMatch
  clock: number
}

export function ScoreboardBar({ match, clock }: ScoreboardBarProps) {
  const crestSize = 'h-[clamp(26px,4.6dvh,40px)] w-[clamp(26px,4.6dvh,40px)]'
  return (
    <div className="flex h-full w-full max-w-[620px] items-center justify-center gap-2.5 rounded-2xl border border-white/5 bg-[#070e19]/95 px-3">
      {/* local */}
      <div className="flex min-w-0 items-center justify-end gap-2">
        <p className="short:hidden truncate text-[clamp(12px,2dvh,16px)] font-bold leading-tight text-white">
          {match.home.name}
        </p>
        <img src={match.home.crest} alt="" className={`${crestSize} shrink-0 object-contain`} />
      </div>

      {/* marcador central */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-[clamp(18px,3.4dvh,28px)] font-extrabold leading-none tabular-nums text-white">
          <span>{match.score.home}</span>
          <span className="font-semibold text-white/40">–</span>
          <span>{match.score.away}</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-white/5 px-2.5 py-1 leading-none">
          <p className="text-[clamp(13px,2.6dvh,20px)] font-bold tabular-nums text-white">
            {formatClock(clock)}
          </p>
          <p className="mt-1 text-[clamp(9px,1.4dvh,11px)] font-semibold tracking-wide text-white/45">
            {phaseLabel(match.phase)}
          </p>
        </div>
      </div>

      {/* visitante */}
      <div className="flex min-w-0 items-center gap-2">
        <img src={match.away.crest} alt="" className={`${crestSize} shrink-0 object-contain`} />
        <p className="short:hidden truncate text-[clamp(12px,2dvh,16px)] font-bold leading-tight text-white">
          {match.away.name}
        </p>
      </div>
    </div>
  )
}
