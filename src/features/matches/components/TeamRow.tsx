import { Crest } from '@/components/ui/Crest'
import type { Team } from '../types'

function TeamBlock({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Crest src={team.crest} alt={team.name} className="h-14 w-14" />
      <p className="mt-2 w-full truncate text-center text-[15px] font-bold leading-tight text-ink">{team.name}</p>
    </div>
  )
}

interface ScoreProps {
  score: { home: number; away: number } | null
}

function Score({ score }: ScoreProps) {
  return (
    <div className="flex h-14 shrink-0 flex-col items-center justify-center gap-0.5 px-1">
      {score ? (
        <>
          <span className="text-[20px] font-extrabold leading-none tabular-nums text-ink">{score.home}</span>
          <span className="text-[13px] font-medium leading-none text-ink-mute">–</span>
          <span className="text-[20px] font-extrabold leading-none tabular-nums text-ink">{score.away}</span>
        </>
      ) : (
        <span className="text-[22px] font-semibold leading-none text-ink-mute">–</span>
      )}
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
    <div className="flex items-start justify-between gap-2">
      <TeamBlock team={home} />
      <Score score={score} />
      <TeamBlock team={away} />
    </div>
  )
}
