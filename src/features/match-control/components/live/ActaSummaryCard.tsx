import { CalendarDays, Clock, Timer, type LucideIcon } from 'lucide-react'
import { Crest } from '@/components/ui/Crest'
import type { Team } from '@/features/matches/types'

interface ActaSummaryCardProps {
  home: Team
  away: Team
  score: { home: number; away: number }
  halfTime: { home: number; away: number }
  dateLabel: string
  startTime: string
  endTime: string
  duration: string
}

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <span className="truncate text-[14px] text-ink-soft">{label}</span>
      </div>
      <span className="ml-3 shrink-0 text-right text-[15px] font-bold text-ink">{value}</span>
    </div>
  )
}

function TeamCell({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Crest src={team.crest} alt={team.name} className="h-[64px] w-[64px]" />
      <p className="mt-2 w-full truncate text-center text-[15px] font-bold leading-tight text-ink">{team.name}</p>
    </div>
  )
}

/** Tarjeta blanca con marcador final, descanso y datos del partido. */
export function ActaSummaryCard({
  home,
  away,
  score,
  halfTime,
  dateLabel,
  startTime,
  endTime,
  duration,
}: ActaSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex justify-center">
        <span className="rounded-full bg-badge-gray px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-badge-gray-ink">
          Resultado final
        </span>
      </div>

      <div className="mt-6 flex items-start justify-between gap-3">
        <TeamCell team={home} />
        <div className="flex flex-col items-center px-1 pt-3">
          <p data-acta-score className="text-[40px] font-extrabold leading-none tabular-nums text-ink">
            {score.home} - {score.away}
          </p>
          <p className="mt-1.5 text-[15px] font-bold leading-none tabular-nums text-ink-mute">
            ({halfTime.home} - {halfTime.away})
          </p>
        </div>
        <TeamCell team={away} />
      </div>

      <div className="mt-6 h-px bg-line" />

      <div className="mt-2">
        <DetailRow icon={CalendarDays} label="Fecha" value={dateLabel} />
        <DetailRow icon={Clock} label="Hora de inicio" value={startTime} />
        <DetailRow icon={Clock} label="Hora de finalización" value={endTime} />
        <DetailRow icon={Timer} label="Duración" value={duration} />
      </div>
    </section>
  )
}
