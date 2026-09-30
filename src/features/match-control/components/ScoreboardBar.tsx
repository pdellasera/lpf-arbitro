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
  const scoreSize = 'shrink-0 text-[clamp(18px,3.4dvh,28px)] font-extrabold leading-none tabular-nums text-white'
  const nameSize = 'short:hidden min-w-0 truncate text-[clamp(12px,2dvh,16px)] font-bold leading-tight text-white'
  return (
    <div
      data-scoreboard
      className="flex h-full w-full max-w-[620px] items-center justify-center gap-2.5 rounded-2xl border border-white/5 bg-[#070e19]/95 px-3"
    >
      {/* local: nombre · escudo · marcador */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <p className={nameSize}>{match.home.name}</p>
        <img src={match.home.crest} alt="" className={`${crestSize} shrink-0 object-contain`} />
        <span data-score="home" className={scoreSize}>
          {match.score.home}
        </span>
      </div>

      {/* centro: cronómetro + fase */}
      <div
        data-clock
        className="flex shrink-0 flex-col items-center rounded-lg bg-white/5 px-2.5 py-1 leading-none"
      >
        <p className="text-[clamp(13px,2.6dvh,20px)] font-bold tabular-nums text-white">
          {formatClock(clock)}
        </p>
        <p className="mt-1 text-[clamp(9px,1.4dvh,11px)] font-semibold tracking-wide text-white/45">
          {phaseLabel(match.phase)}
        </p>
      </div>

      {/* visitante: marcador · escudo · nombre */}
      <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
        <span data-score="away" className={scoreSize}>
          {match.score.away}
        </span>
        <img src={match.away.crest} alt="" className={`${crestSize} shrink-0 object-contain`} />
        <p className={nameSize}>{match.away.name}</p>
      </div>
    </div>
  )
}
