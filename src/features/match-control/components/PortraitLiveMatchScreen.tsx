import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Match } from '@/features/matches/types'
import { ACTIONS, type ActionKind } from '../data/actionConfig'
import { LIVE_GRID, LIVE_TABS, type LiveTabId } from '../data/liveGrid'
import { createLiveMatch } from '../data/mockLiveMatch'
import { useLiveMatchState } from '../hooks/useLiveMatchState'
import type { EventDraft } from '../types'
import { matchEndTime } from '../lib/acta'
import { EventActionGrid } from './live/EventActionGrid'
import { LiveScorePanel } from './live/LiveScorePanel'
import { LiveTabBar } from './live/LiveTabBar'
import { AlineacionesTab } from './live/LiveTabsContent'
import { LiveTopBar } from './live/LiveTopBar'
import { LogsSidebar } from './live/LogsSidebar'
import { RegisterEventScreen } from './live/RegisterEventScreen'
import { ActaDocumentScreen } from './acta/ActaDocumentScreen'
import { ActaFinalizacionScreen } from './live/ActaFinalizacionScreen'

interface PortraitLiveMatchScreenProps {
  match: Match
  onBack: () => void
  onHome: () => void
  autoStart?: boolean
}

interface DrawerRequest {
  id: ActionKind
  preset?: string
}

export function PortraitLiveMatchScreen({ match, onBack, onHome, autoStart = false }: PortraitLiveMatchScreenProps) {
  const [initial] = useState(() => createLiveMatch(match))
  const { match: live, seconds, running, phase, recordEvent, startMatch, endHalf } = useLiveMatchState(initial)

  const [tab, setTab] = useState<LiveTabId>('events')
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const [showDoc, setShowDoc] = useState(false)
  const [showActa, setShowActa] = useState(false)

  // Al venir de "Iniciar partido" el cronómetro arranca al montar.
  useEffect(() => {
    if (autoStart) startMatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const minute = Math.floor(seconds / 60)
  const config = drawer ? ACTIONS[drawer.id] : ACTIONS.goal

  const ended = phase === 'ended'
  const hasSecondHalf = live.periods.some((p) => p.half === 2)
  const startTime = match.trailing
  const endTime = ended ? matchEndTime(match.trailing, seconds, hasSecondHalf) : '--:--'

  function openDrawer(id: ActionKind, preset?: string) {
    setSelectedPlayerId(null)
    setDrawer({ id, preset })
  }

  function handleSubmit(draft: EventDraft) {
    if (draft.kind === 'half-end') endHalf(draft.addedMinutes ?? 0)
    else recordEvent(draft)
    setDrawer(null)
    if (draft.playerId) setSelectedPlayerId(draft.playerId)
  }

  function handleTabChange(id: LiveTabId) {
    if (id === 'logs') setLogsOpen(true)
    else setTab(id)
  }

  // Acta (firma): se abre al finalizar (árbitro) o con "Siguiente" (comisionado).
  if (showActa) {
    return showDoc ? (
      <ActaDocumentScreen
        match={match}
        live={live}
        onBack={() => setShowDoc(false)}
        onHome={onHome}
      />
    ) : (
      <ActaFinalizacionScreen
        match={match}
        live={live}
        seconds={seconds}
        onBack={() => setShowActa(false)}
        onClose={() => setShowDoc(true)}
      />
    )
  }

  return (
    <div className="app-h h-dvh relative mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-header-bottom">
      <LiveTopBar onBack={onBack} />

      <main className="flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-page">
        <LiveScorePanel
          home={live.home}
          away={live.away}
          score={live.score}
          running={running}
          league={match.league}
          jornada={match.jornada}
          ended={ended}
          startTime={startTime}
          endTime={endTime}
        />

        <LiveTabBar tabs={LIVE_TABS} active={tab} onChange={handleTabChange} />

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {tab === 'events' && (
            <EventActionGrid items={LIVE_GRID} onSelect={(item) => openDrawer(item.id, item.preset)} />
          )}
          {tab === 'lineup' && <AlineacionesTab match={live} />}
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-line bg-page px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_16px_rgba(15,23,42,0.05)]">
          <div className="flex gap-3">
            <button
              type="button"
              data-live-back
              onClick={onBack}
              className="flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-badge-gray px-6 text-[16px] font-bold text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
            <button
              type="button"
              data-live-next
              onClick={() => setShowActa(true)}
              className="flex h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(0,98,253,0.32)] transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Siguiente
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      <RegisterEventScreen
        open={drawer !== null}
        config={config}
        match={live}
        minute={minute}
        selectedPlayerId={selectedPlayerId}
        presetOption={drawer?.preset}
        onSelectPlayer={setSelectedPlayerId}
        onClose={() => setDrawer(null)}
        onSelectAction={(id) => setDrawer({ id })}
        onSubmit={handleSubmit}
      />

      <LogsSidebar open={logsOpen} match={live} onClose={() => setLogsOpen(false)} />
    </div>
  )
}
