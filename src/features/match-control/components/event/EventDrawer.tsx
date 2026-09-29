import { useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ActionKind, ActionConfig } from '../../data/actionConfig'
import type { EventDraft, LiveMatch, Side } from '../../types'
import { ChoiceChips } from './ChoiceChips'
import { DrawerFooter } from './DrawerFooter'
import { EventDrawerHeader } from './EventDrawerHeader'
import { MinuteStepper } from './MinuteStepper'
import { PlayerPickList } from './PlayerPickList'
import { SideSelector } from './SideSelector'

function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex h-11 items-center gap-2.5 rounded-xl bg-[#0d1f32] px-3.5">
      <Search className="h-[18px] w-[18px] shrink-0 text-[#8ca0b5]" />
      <input
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
      />
    </div>
  )
}

interface EventDrawerProps {
  open: boolean
  config: ActionConfig
  match: LiveMatch
  minute: number
  onClose: () => void
  onSelectAction: (id: ActionKind) => void
  onSubmit: (draft: EventDraft) => void
}

export function EventDrawer({
  open,
  config,
  match,
  minute: currentMinute,
  onClose,
  onSelectAction,
  onSubmit,
}: EventDrawerProps) {
  const [side, setSide] = useState<Side | 'neutral'>('home')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [secondPlayerId, setSecondPlayerId] = useState<string | null>(null)
  const [option, setOption] = useState<string | null>(null)
  const [minute, setMinute] = useState(currentMinute)
  const [note, setNote] = useState('')
  const [addedMinutes, setAddedMinutes] = useState(0)

  const starters = match.players.filter((p) => p.side === side && p.starter)
  const bench = match.players.filter((p) => p.side === side && !p.starter)

  function handleSubmit() {
    const player = match.players.find((p) => p.id === playerId)
    onSubmit({
      kind: config.eventKind,
      side,
      playerId: playerId ?? undefined,
      player: player?.name,
      secondaryPlayerId: secondPlayerId ?? undefined,
      minute,
      option: option ?? undefined,
      note: note || undefined,
      addedMinutes: config.showAddedMinutes ? addedMinutes : undefined,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          className="absolute bottom-0 right-0 top-0 z-30 flex flex-col overflow-hidden rounded-l-2xl bg-[#001222]/95"
          style={{ width: 'clamp(280px, 24vw, 360px)' }}
          role="dialog"
          aria-label={config.title}
        >
          <div className="no-scrollbar flex-1 overflow-y-auto p-4">
            <EventDrawerHeader title={config.title} onClose={onClose} />

            {config.moreItems ? (
              <div className="mt-3.5 flex flex-col gap-2">
                {config.moreItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAction(item.id)}
                    className="flex h-[52px] items-center justify-between rounded-xl bg-[#0d1f32] px-4 transition-colors hover:bg-[#12263b]"
                  >
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                    <ChevronRight className="h-[18px] w-[18px] text-white/40" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3.5 flex flex-col gap-3.5">
                {config.showSide && (
                  <SideSelector value={side} onSelect={setSide} neutral={config.sideNeutral} />
                )}

                {config.showPlayers && side !== 'neutral' && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-white">Jugador</p>
                    <PlayerPickList players={starters} value={playerId} onSelect={setPlayerId} />
                  </div>
                )}

                {config.showSecondPlayers && side !== 'neutral' && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-white">{config.secondLabel ?? 'Jugador que entra'}</p>
                    <PlayerPickList
                      players={bench}
                      value={secondPlayerId}
                      onSelect={setSecondPlayerId}
                      placeholder="Buscar suplente..."
                    />
                  </div>
                )}

                {config.options && (
                  <div>
                    {config.optionsLabel && (
                      <p className="mb-2 text-sm font-semibold text-white">{config.optionsLabel}</p>
                    )}
                    <ChoiceChips options={config.options} value={option} onSelect={setOption} />
                  </div>
                )}

                <MinuteStepper value={minute} onChange={setMinute} />

                {config.showAddedMinutes && (
                  <MinuteStepper label="Tiempo añadido (min)" value={addedMinutes} onChange={setAddedMinutes} />
                )}

                {config.showAssist && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-white">Asistencia (opcional)</p>
                    <SearchField placeholder="Buscar jugador..." />
                  </div>
                )}

                {config.showNote && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-white">{config.noteLabel ?? 'Nota'}</p>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Escribe aquí…"
                      className="w-full resize-none rounded-xl bg-[#0d1f32] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 p-3">
            <DrawerFooter onCancel={onClose} onSubmit={handleSubmit} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

