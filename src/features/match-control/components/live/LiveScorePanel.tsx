import { cn } from '@/lib/cn'
import { Crest } from '@/components/ui/Crest'
import { LpfLogo } from '@/components/ui/LpfLogo'
import type { Team } from '@/features/matches/types'
import { formatClock } from '../../lib/formatClock'

interface LiveScorePanelProps {
  home: Team
  away: Team
  score: { home: number; away: number }
  seconds: number
  running: boolean
  league: string
  jornada: number
}

function TeamBlock({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Crest src={team.crest} alt={team.name} className="h-[84px] w-[84px]" />
      <p className="mt-2 w-full truncate text-center text-[15px] font-bold leading-tight text-ink">{team.name}</p>
    </div>
  )
}

export function LiveScorePanel({ home, away, score, seconds, running, league, jornada }: LiveScorePanelProps) {
  return (
    <section className="bg-white px-5 pb-5 pt-6">
      {/* Liga + jornada · estado en vivo */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-header-top">
            <LpfLogo className="h-4 w-4" />
          </span>
          <span className="truncate text-[15px] font-semibold leading-tight text-ink-soft">
            {league} · Jornada {jornada}
          </span>
        </div>
        <span
          data-live-pill
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5',
            running ? 'bg-accent-green-soft' : 'bg-badge-gray',
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', running ? 'bg-accent-green' : 'bg-ink-mute')} />
          <span
            className={cn(
              'text-[12px] font-extrabold uppercase tracking-wide',
              running ? 'text-accent-green' : 'text-badge-gray-ink',
            )}
          >
            {running ? 'En vivo' : 'En pausa'}
          </span>
        </span>
      </div>

      {/* Marcador + reloj */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <TeamBlock team={home} />
        <div className="flex flex-col items-center px-1">
          <p
            data-live-score
            className="text-[40px] font-extrabold leading-none tracking-tight tabular-nums text-ink"
          >
            {score.home} – {score.away}
          </p>
          <p data-clock className="mt-2 text-[20px] font-bold leading-none tabular-nums text-ink">
            {formatClock(seconds)}
          </p>
        </div>
        <TeamBlock team={away} />
      </div>
    </section>
  )
}
