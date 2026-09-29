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
  const crestSize = 'h-[clamp(34px,5.4dvh,54px)] w-[clamp(34px,5.4dvh,54px)]'
  return (
    <div className="flex w-full max-w-[600px] items-center justify-between rounded-2xl border border-white/5 bg-[#070e19]/95 px-3 py-1.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <img src={match.home.crest} alt="" className={`${crestSize} shrink-0 object-contain`} />
        <div className="min-w-0">
          <p className="truncate text-[clamp(12px,1.8dvh,16px)] font-bold leading-tight text-white">{match.home.name}</p>
          <p className="text-[clamp(10px,1.4dvh,12px)] text-white/50">Local</p>
        </div>
      </div>

      <div className="flex flex-col items-center px-2">
        <div className="flex items-center gap-2 text-[clamp(26px,4.4dvh,44px)] font-extrabold leading-none tabular-nums text-white">
          <span>{match.score.home}</span>
          <span className="font-semibold text-white/40">–</span>
          <span>{match.score.away}</span>
        </div>
        <div className="mt-1 rounded-lg bg-white/5 px-3 py-0.5">
          <p className="text-[clamp(16px,2.4dvh,24px)] font-bold leading-none tabular-nums text-white">
            {formatClock(clock)}
          </p>
        </div>
        <p className="mt-1 text-[clamp(10px,1.5dvh,13px)] font-semibold tracking-wide text-white/45">
          {phaseLabel(match.phase)}
        </p>
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
        <div className="min-w-0 text-right">
          <p className="truncate text-[clamp(12px,1.8dvh,16px)] font-bold leading-tight text-white">{match.away.name}</p>
          <p className="text-[clamp(10px,1.4dvh,12px)] text-white/50">Visitante</p>
        </div>
        <img src={match.away.crest} alt="" className={`${crestSize} shrink-0 object-contain`} />
      </div>
    </div>
  )
}
