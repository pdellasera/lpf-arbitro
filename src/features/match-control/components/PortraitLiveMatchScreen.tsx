import { useEffect, useState } from 'react'
import { CheckCircle2, Flag, Play, type LucideIcon } from 'lucide-react'
import type { Match } from '@/features/matches/types'
import { ACTIONS, type ActionKind } from '../data/actionConfig'
import { LIVE_GRID, LIVE_TABS, type LiveTabId } from '../data/liveGrid'
import { createLiveMatch } from '../data/mockLiveMatch'
import { useLiveMatchState } from '../hooks/useLiveMatchState'
import type { EventDraft, MatchPhase } from '../types'
import { EventActionGrid } from './live/EventActionGrid'
import { FinishHalfButton } from './live/FinishHalfButton'
import { LiveScorePanel } from './live/LiveScorePanel'
import { LiveTabBar } from './live/LiveTabBar'
import { AlineacionesTab } from './live/LiveTabsContent'
import { LiveTopBar } from './live/LiveTopBar'
import { LogsSidebar } from './live/LogsSidebar'
import { PauseMatchButton } from './live/PauseMatchButton'
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
  const { match: live, seconds, running, phase, recordEvent, startMatch, startSecondHalf, endHalf, toggleRunning } = useLiveMatchState(initial)

  const [tab, setTab] = useState<LiveTabId>('events')
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const [showDoc, setShowDoc] = useState(false)

  // Al venir de "Iniciar partido" el cronómetro arranca al montar.
  useEffect(() => {
    if (autoStart) startMatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const minute = Math.floor(seconds / 60)
  const config = drawer ? ACTIONS[drawer.id] : ACTIONS.goal

  // Botón de periodo: cambia de etiqueta/acción según la fase del partido.
  const periodAction: Record<MatchPhase, { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean }> = {
    pre: { label: 'Iniciar partido', icon: Play, onClick: startMatch },
    first: { label: 'Finalizar primer tiempo', icon: Flag, onClick: () => endHalf(0) },
    break: { label: 'Iniciar segunda parte', icon: Play, onClick: startSecondHalf },
    second: { label: 'Finalizar Partido', icon: Flag, onClick: () => endHalf(0) },
    ended: { label: 'Partido finalizado', icon: CheckCircle2, onClick: () => {}, disabled: true },
  }
  const current = periodAction[phase]

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

  // Partido finalizado → pantalla de acta (firma) y, al cerrarla, documento PDF.
  if (phase === 'ended') {
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
        onBack={onBack}
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
          seconds={seconds}
          running={running}
          league={match.league}
          jornada={match.jornada}
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
            <FinishHalfButton label={current.label} icon={current.icon} disabled={current.disabled} onClick={current.onClick} />
            <PauseMatchButton running={running} onToggle={toggleRunning} />
          </div>
        </div>
      </main>

      <RegisterEventScreen
        open={drawer !== null}
        config={config}
        match={live}
        minute={minute}
        seconds={seconds}
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
