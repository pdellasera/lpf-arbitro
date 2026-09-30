import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Match } from '@/features/matches/types'
import { ACTIONS, type ActionKind } from '../data/actionConfig'
import { createLiveMatch } from '../data/mockLiveMatch'
import { useLiveMatchState } from '../hooks/useLiveMatchState'
import { useOrientation } from '../hooks/useOrientation'
import type { EventDraft } from '../types'
import { EventDrawer } from './event/EventDrawer'
import { MatchPhaseControl } from './MatchPhaseControl'
import { MatchTimeline } from './MatchTimeline'
import { OrientationGate } from './OrientationGate'
import { PeriodsDialog } from './PeriodsDialog'
import { PitchBoard } from './PitchBoard'
import { PlayerMarker } from './PlayerMarker'
import { RefereeActionRail } from './RefereeActionRail'
import { ScoreboardBar } from './ScoreboardBar'
import { TopQuickActions } from './TopQuickActions'

interface LiveMatchScreenProps {
  match: Match
  onBack: () => void
}

export function LiveMatchScreen({ match, onBack }: LiveMatchScreenProps) {
  const orientation = useOrientation()
  const [initial] = useState(() => createLiveMatch(match))
  const {
    match: live,
    seconds,
    running,
    phase,
    periods,
    recordEvent,
    startMatch,
    startSecondHalf,
    endHalf,
    toggleRunning,
  } = useLiveMatchState(initial)

  const [activeAction, setActiveAction] = useState<ActionKind>('goal')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [registryOpen, setRegistryOpen] = useState(false)
  const [railOpen, setRailOpen] = useState(false)

  const minute = Math.floor(seconds / 60)
  const config = ACTIONS[activeAction]

  function handleSelectAction(id: ActionKind) {
    setActiveAction(id)
    setRailOpen(false)
    setDrawerOpen(true)
  }

  function handleSubmit(draft: EventDraft) {
    if (draft.kind === 'half-end') {
      endHalf(draft.addedMinutes ?? 0)
    } else {
      recordEvent(draft)
    }
    setDrawerOpen(false)
    if (draft.playerId) setSelectedPlayerId(draft.playerId)
  }

  function handlePhasePrimary() {
    setRailOpen(false)
    if (phase === 'pre') {
      startMatch()
    } else if (phase === 'break') {
      startSecondHalf()
    } else if (phase === 'first' || phase === 'second') {
      setActiveAction('half-end')
      setDrawerOpen(true)
    }
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#04121f] text-white">
      {orientation === 'portrait' ? (
        <OrientationGate />
      ) : (
        <>
          {/* Capa 0/1: escenario a sangre (cancha + gradas + césped a pantalla completa) */}
          <PitchBoard>
            {live.players.map((p) => (
              <PlayerMarker
                key={p.id}
                player={p}
                selected={p.id === selectedPlayerId}
                onSelect={setSelectedPlayerId}
              />
            ))}
          </PitchBoard>

          {/* Capa 2: barra superior flotante */}
          <header
            className="absolute inset-x-2 z-20 flex items-center gap-2"
            style={{ top: 'max(var(--live-gap), env(safe-area-inset-top))', height: 'var(--live-header-h)' }}
          >
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver"
              className="flex shrink-0 items-center justify-center rounded-2xl bg-[#0f2135]/90 text-white ring-1 ring-white/10 backdrop-blur hover:bg-[#0f2135]"
              style={{ width: 'clamp(38px, 7.2dvh, 52px)', height: 'clamp(38px, 7.2dvh, 52px)' }}
            >
              <ArrowLeft className="h-[clamp(18px,2.8dvh,24px)] w-[clamp(18px,2.8dvh,24px)]" />
            </button>
            <div className="flex min-w-0 flex-1 justify-center">
              <ScoreboardBar match={live} clock={seconds} />
            </div>
            <TopQuickActions />
          </header>

          {/* Sidebar modal de acciones (trigger flotante + panel sobre la cancha) */}
          <RefereeActionRail
            open={railOpen}
            active={activeAction}
            onSelect={handleSelectAction}
            onOpen={() => setRailOpen(true)}
            onClose={() => setRailOpen(false)}
            header={
              <MatchPhaseControl
                phase={phase}
                periodsCount={periods.length}
                onPrimary={handlePhasePrimary}
                onRegistry={() => {
                  setRailOpen(false)
                  setRegistryOpen(true)
                }}
              />
            }
          />

          {/* Timeline flotante */}
          <div
            className="live-timeline absolute inset-x-2 z-20"
            style={{ bottom: 'max(var(--live-gap), env(safe-area-inset-bottom))', height: 'var(--live-timeline-h)' }}
          >
            <MatchTimeline match={live} minute={minute} running={running} onTogglePlay={toggleRunning} />
          </div>

          {/* Panel de evento (tarjeta flotante) */}
          <EventDrawer
            key={config.id}
            open={drawerOpen}
            config={config}
            match={live}
            minute={minute}
            onClose={() => setDrawerOpen(false)}
            onSelectAction={handleSelectAction}
            onSubmit={handleSubmit}
          />

          <PeriodsDialog open={registryOpen} periods={periods} onClose={() => setRegistryOpen(false)} />
        </>
      )}
    </div>
  )
}
