import { Crest } from '@/components/ui/Crest'
import type { Team } from '@/features/matches/types'
import { formatClock } from '../../lib/formatClock'

interface ScoreStripProps {
  home: Team
  away: Team
  score: { home: number; away: number }
  seconds: number
}

function TeamCell({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Crest src={team.crest} alt={team.name} className="h-14 w-14" />
      <p className="mt-1.5 w-full truncate text-center text-[15px] font-bold leading-tight text-ink">{team.name}</p>
    </div>
  )
}

/** Marcador compacto que encabeza las pantallas de registro (escu­dos + marcador + reloj). */
export function ScoreStrip({ home, away, score, seconds }: ScoreStripProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-5">
      <TeamCell team={home} />
      <div className="flex flex-col items-center px-1">
        <p
          data-strip-score
          className="text-[38px] font-extrabold leading-none tracking-tight tabular-nums text-ink"
        >
          {score.home} - {score.away}
        </p>
        <p className="mt-1.5 text-[18px] font-bold leading-none tabular-nums text-ink">
          {formatClock(seconds)}
        </p>
      </div>
      <TeamCell team={away} />
    </div>
  )
}
