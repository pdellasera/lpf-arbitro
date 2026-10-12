import { useEffect, useState } from 'react'
import type { Match } from '@/features/matches/types'
import { ACTIONS } from '../data/actionConfig'
import { LIVE_SECTIONS } from '../data/liveSections'
import { createLiveMatch } from '../data/mockLiveMatch'
import { useLiveMatchState } from '../hooks/useLiveMatchState'
import type { EventDraft } from '../types'
import { LineupSidebar } from './live/LineupSidebar'
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

export function PortraitLiveMatchScreen({ match, onBack, onHome, autoStart = false }: PortraitLiveMatchScreenProps) {
  const [initial] = useState(() => createLiveMatch(match))
  const { match: live, seconds, recordEvent, startMatch, endHalf } = useLiveMatchState(initial)

  const [step, setStep] = useState(0)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const [lineupOpen, setLineupOpen] = useState(false)
  const [showDoc, setShowDoc] = useState(false)
  const [showActa, setShowActa] = useState(false)

  // Al venir de "Iniciar partido" el cronómetro arranca al montar.
  useEffect(() => {
    if (autoStart) startMatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const minute = Math.floor(seconds / 60)
  const section = LIVE_SECTIONS[step]

  function handleSubmit(draft: EventDraft) {
    if (draft.kind === 'half-end') endHalf(draft.addedMinutes ?? 0)
    else recordEvent(draft)
    if (draft.playerId) setSelectedPlayerId(draft.playerId)
  }

  function goNext() {
    if (step < LIVE_SECTIONS.length - 1) setStep(step + 1)
    else setShowActa(true)
  }

  function goBack() {
    if (step === 0) onBack()
    else setStep(step - 1)
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
      <RegisterEventScreen
        screenId={section.id}
        config={ACTIONS[section.action]}
        match={live}
        minute={minute}
        selectedPlayerId={selectedPlayerId}
        presetOption={section.preset}
        onSelectPlayer={setSelectedPlayerId}
        onSubmit={handleSubmit}
        onBack={goBack}
        onNext={goNext}
        onLineup={() => setLineupOpen(true)}
        onLogs={() => setLogsOpen(true)}
      />

      <LineupSidebar open={lineupOpen} match={live} onClose={() => setLineupOpen(false)} />

      <LogsSidebar open={logsOpen} match={live} onClose={() => setLogsOpen(false)} />
    </div>
  )
}
