import { Crest } from '@/components/ui/Crest'
import type { Team } from '../types'

function TeamBlock({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2.5">
      <Crest src={team.crest} alt={team.name} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold leading-tight text-ink">{team.name}</p>
        <p className="mt-1 text-[12px] leading-none text-ink-mute">{team.country}</p>
      </div>
    </div>
  )
}

interface ScoreProps {
  score: { home: number; away: number } | null
}

function Score({ score }: ScoreProps) {
  if (!score) {
    return <span className="px-2 text-[18px] font-semibold text-ink-mute">—</span>
  }
  return (
    <div className="flex shrink-0 items-center gap-2 px-2">
      <span className="text-[22px] font-extrabold leading-none tabular-nums text-ink">{score.home}</span>
      <span className="text-[15px] font-medium leading-none text-ink-mute">–</span>
      <span className="text-[22px] font-extrabold leading-none tabular-nums text-ink">{score.away}</span>
    </div>
  )
}

interface TeamRowProps {
  home: Team
  away: Team
  score: { home: number; away: number } | null
}

export function TeamRow({ home, away, score }: TeamRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 justify-start">
        <TeamBlock team={home} />
      </div>
      <Score score={score} />
      <div className="flex min-w-0 flex-1 justify-end">
        <TeamBlock team={away} />
      </div>
    </div>
  )
}
