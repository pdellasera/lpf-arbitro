import { useRef } from 'react'
import { Lock } from 'lucide-react'
import { formatLongDate } from '@/features/matches/lib/formatDate'
import type { Match } from '@/features/matches/types'
import type { LiveMatch } from '../../types'
import { formatDuration, halfTimeScore, matchEndTime } from '../../lib/acta'
import { ActaSummaryCard } from './ActaSummaryCard'
import { ActaTopBar } from './ActaTopBar'
import { SignaturePad, type SignaturePadHandle } from './SignaturePad'

interface ActaFinalizacionScreenProps {
  match: Match
  live: LiveMatch
  seconds: number
  onBack: () => void
  onClose: () => void
}

/** Pantalla que se muestra al finalizar el partido: resumen + firma del árbitro. */
export function ActaFinalizacionScreen({
  match,
  live,
  seconds,
  onBack,
  onClose,
}: ActaFinalizacionScreenProps) {
  const padRef = useRef<SignaturePadHandle>(null)

  const halfTime = halfTimeScore(live.events)
  const hasSecondHalf = live.periods.some((p) => p.half === 2)
  const endTime = matchEndTime(match.trailing, seconds, hasSecondHalf)
  const duration = formatDuration(live.periods)
  const dateLabel = match.date ? formatLongDate(match.date) : ''

  return (
    <div data-acta className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <ActaTopBar onBack={onBack} />

      <main className="flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white">
        <div className="flex-1 overflow-y-auto px-5 pt-6">
          <ActaSummaryCard
            home={live.home}
            away={live.away}
            score={live.score}
            halfTime={halfTime}
            dateLabel={dateLabel}
            startTime={match.trailing}
            endTime={endTime}
            duration={duration}
          />

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-ink">Firma del árbitro</h3>
              <button
                type="button"
                data-acta-clear
                onClick={() => padRef.current?.clear()}
                className="text-[14px] font-bold text-brand transition-transform active:scale-95"
              >
                Limpiar
              </button>
            </div>
            <div className="mt-3">
              <SignaturePad ref={padRef} />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            data-acta-close
            onClick={() => onClose()}
            className="flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-day-active text-[17px] font-extrabold text-ink shadow-[0_10px_24px_rgba(9,30,66,0.14)] transition-transform active:scale-[0.99]"
          >
            <Lock className="h-5 w-5" />
            Cerrar acta del partido
          </button>
        </div>
      </main>
    </div>
  )
}
