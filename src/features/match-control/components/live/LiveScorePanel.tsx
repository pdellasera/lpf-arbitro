import { cn } from '@/lib/cn'
import { Crest } from '@/components/ui/Crest'
import { LpfLogo } from '@/components/ui/LpfLogo'
import type { Team } from '@/features/matches/types'

interface LiveScorePanelProps {
  home: Team
  away: Team
  score: { home: number; away: number }
  running: boolean
  league: string
  jornada: number
  ended?: boolean
  startTime?: string
  endTime?: string
}

function TeamBlock({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Crest src={team.crest} alt={team.name} className="h-[84px] w-[84px]" />
      <p className="mt-2 w-full truncate text-center text-[15px] font-bold leading-tight text-ink">{team.name}</p>
    </div>
  )
}

export function LiveScorePanel({ home, away, score, running, league, jornada, ended = false, startTime = '', endTime = '' }: LiveScorePanelProps) {
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
            {ended ? 'Finalizado' : running ? 'En vivo' : 'En pausa'}
          </span>
        </span>
      </div>

      {/* Marcador */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <TeamBlock team={home} />
        <div className="flex flex-col items-center px-1">
          <p
            data-live-score
            className="text-[40px] font-extrabold leading-none tracking-tight tabular-nums text-ink"
          >
            {score.home} – {score.away}
          </p>
        </div>
        <TeamBlock team={away} />
      </div>

      {/* Inicio - finalización del partido */}
      <p data-live-end-times className="mt-4 border-t border-line pt-4 text-center text-[14px] font-semibold leading-tight text-ink-soft">
        Inicio de partido <span className="font-bold text-ink">{startTime}</span> - Finalización de partido{' '}
        <span className="font-bold text-ink">{endTime}</span>
      </p>
    </section>
  )
}
