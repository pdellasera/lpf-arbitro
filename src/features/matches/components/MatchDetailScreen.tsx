import { ArrowLeft, ArrowRight, ClipboardList, MapPin, User, UserRound, Users, type LucideIcon } from 'lucide-react'
import { Crest } from '@/components/ui/Crest'
import { LpfLogo } from '@/components/ui/LpfLogo'
import { formatLongDate } from '../lib/formatDate'
import type { Match, Team } from '../types'
import { MatchDetailHeader } from './MatchDetailHeader'
import { RefereeRow } from './RefereeRow'

interface MatchDetailScreenProps {
  match: Match
  onBack: () => void
  onNext: () => void
}

const REF_ICONS: LucideIcon[] = [User, ClipboardList, Users, UserRound]

function TeamBlock({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Crest src={team.crest} alt={team.name} className="h-[84px] w-[84px]" />
      <p className="mt-3 w-full truncate text-center text-[16px] font-bold leading-tight text-ink">{team.name}</p>
    </div>
  )
}

export function MatchDetailScreen({ match, onBack, onNext }: MatchDetailScreenProps) {
  const referees = match.referees ?? []
  const city = match.city ?? match.home.country

  return (
    <div className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <MatchDetailHeader onBack={onBack} />

      <main className="flex flex-1 flex-col rounded-t-[28px] bg-page">
        <div className="flex-1 px-5 pt-6">
          {/* Cabecera interna */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-badge-gray text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-[24px] font-extrabold leading-none tracking-tight text-ink">Detalle del partido</h2>
              <p className="mt-1.5 text-[14px] leading-tight text-ink-soft">Revisa la información y confirma el inicio</p>
            </div>
          </div>

          <div className="mt-5 h-px bg-line" />

          {/* Liga + jornada */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-header-top">
              <LpfLogo className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold leading-tight text-ink-soft">
              {match.league} · Jornada {match.jornada}
            </span>
          </div>

          {/* Equipos */}
          <div className="mt-7 flex items-start justify-between gap-3">
            <TeamBlock team={match.home} />
            <span className="mt-[30px] text-[22px] font-bold leading-none text-ink-mute">–</span>
            <TeamBlock team={match.away} />
          </div>

          {/* Fecha / hora */}
          <div className="mt-6 flex flex-col items-center gap-1">
            {match.date && <p className="text-[14px] leading-tight text-ink-soft">{formatLongDate(match.date)}</p>}
            <p className="text-[19px] font-extrabold leading-none text-ink">{match.trailing}</p>
          </div>

          {/* Sede */}
          <div className="mt-6 flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ink-mute" />
              <p className="text-[15px] leading-tight text-ink-soft">{match.venue}</p>
            </div>
            <p className="text-[14px] leading-tight text-ink-mute">{city}</p>
          </div>

          <div className="mt-7 h-px bg-line" />

          {/* Equipo arbitral */}
          <h3 className="mt-6 text-[17px] font-extrabold tracking-tight text-ink">Equipo arbitral</h3>
          <div className="mt-4 flex flex-col gap-5">
            {referees.map((ref, index) => (
              <RefereeRow
                key={ref.role}
                icon={REF_ICONS[index % REF_ICONS.length]}
                role={ref.role}
                name={ref.name}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-badge-gray px-6 text-[16px] font-bold text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
            <button
              type="button"
              data-detail-next
              onClick={onNext}
              className="flex h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(0,98,253,0.32)] transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Siguiente
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
