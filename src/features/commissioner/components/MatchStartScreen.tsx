import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MATCH_START_DELAYS, type YesNoValue } from '../data/matchStartDelays'
import { DelaysCard } from './DelaysCard'
import { KickoffCard, type ExtraTimePeriod } from './KickoffCard'
import { MatchStartTopBar } from './MatchStartTopBar'

interface MatchStartScreenProps {
  onBack: () => void
  onNext: () => void
}

/** "Inicio del partido" del Comisionado: pitazos + tiempo extra + retrasos. */
export function MatchStartScreen({ onBack, onNext }: MatchStartScreenProps) {
  const [kickoff, setKickoff] = useState<string | null>(null)
  const [finalTime, setFinalTime] = useState<string | null>(null)
  const [extraTime, setExtraTime] = useState<{ first: number; second: number }>({ first: 0, second: 0 })
  const [delays, setDelays] = useState<Record<string, YesNoValue>>(() =>
    Object.fromEntries(MATCH_START_DELAYS.map((delay) => [delay.id, delay.defaultValue])),
  )

  function currentTime() {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  function setExtraTimePeriod(period: ExtraTimePeriod, minutes: number) {
    setExtraTime((prev) => ({ ...prev, [period]: minutes }))
  }

  function setDelay(id: string, value: YesNoValue) {
    setDelays((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div data-start className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <MatchStartTopBar onBack={onBack} />

      <main className="flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-page">
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          <div className="flex flex-col gap-4">
            <KickoffCard
              kickoff={kickoff}
              finalTime={finalTime}
              onRecordKickoff={() => setKickoff(currentTime())}
              onRecordFinal={() => setFinalTime(currentTime())}
              extraTime={extraTime}
              onExtraTimeChange={setExtraTimePeriod}
            />
            <DelaysCard delays={MATCH_START_DELAYS} values={delays} onChange={setDelay} />
          </div>
          <div className="h-4" />
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex gap-3">
            <button
              type="button"
              data-start-back
              onClick={onBack}
              className="flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-badge-gray px-6 text-[16px] font-bold text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
            <button
              type="button"
              data-start-next
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
