import { useEffect, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ActionKind, ActionConfig } from '../../data/actionConfig'
import { getBookings } from '../../lib/bookings'
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
  selectedPlayerId: string | null
  onSelectPlayer: (id: string) => void
  onClose: () => void
  onSelectAction: (id: ActionKind) => void
  onSubmit: (draft: EventDraft) => void
}

export function EventDrawer({
  open,
  config,
  match,
  minute: currentMinute,
  selectedPlayerId,
  onSelectPlayer,
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
  const [subTab, setSubTab] = useState<'out' | 'in'>('out')

  const starters = match.players.filter((p) => p.side === side && p.starter)
  const bench = match.players.filter((p) => p.side === side && !p.starter)
  const bookings = getBookings(match.events)

  // Sincroniza un dorsal tocado en la cancha con el panel (y cambia de lado si toca).
  useEffect(() => {
    if (!open || !selectedPlayerId) return
    const p = match.players.find((x) => x.id === selectedPlayerId)
    if (!p) return
    setSide((prev) => (prev === p.side ? prev : p.side))
    setPlayerId((prev) => (prev === p.id ? prev : p.id))
    setSubTab('out')
  }, [open, selectedPlayerId, match.players])

  function selectPlayer(id: string) {
    setPlayerId(id)
    onSelectPlayer(id)
  }

  function selectSecond(id: string) {
    setSecondPlayerId(id)
  }

  function handleSubmit() {
    const player = match.players.find((p) => p.id === playerId)
    const kind = (option != null && config.optionKinds?.[option]) || config.eventKind
    onSubmit({
      kind,
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

  const showPlayers = config.showPlayers && side !== 'neutral'
  const showSecond = config.showSecondPlayers && side !== 'neutral'

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          data-drawer
          className="event-drawer absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#001222]/95 shadow-2xl backdrop-blur"
          role="dialog"
          aria-label={config.title}
        >
          <div className="shrink-0 px-4 pt-3 short:px-3 short:pt-2">
            <EventDrawerHeader title={config.title} onClose={onClose} />
          </div>

          {config.moreItems ? (
            <div data-drawer-scroll className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
              <div className="flex flex-col gap-2">
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
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col short:flex-row short:overflow-hidden">
              <div data-drawer-scroll className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3.5 short:px-3 short:py-2">
                <div className="flex flex-col gap-3.5 short:gap-2.5">
                  {config.showSide && (
                    <SideSelector value={side} onSelect={setSide} neutral={config.sideNeutral} />
                  )}

                  {showPlayers && !showSecond && (
                    <div>
                      <p className="mb-1.5 text-sm font-semibold text-white short:mb-1 short:text-[12px]">Jugador</p>
                      <PlayerPickList players={starters} value={playerId} onSelect={selectPlayer} bookings={bookings} />
                    </div>
                  )}

                  {showSecond && (
                    <div>
                      <div className="mb-1.5 flex gap-1 rounded-xl bg-[#07172b] p-1">
                        {(['out', 'in'] as const).map((t) => {
                          const active = subTab === t
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSubTab(t)}
                              className="h-9 flex-1 rounded-lg text-center text-[13px] font-semibold transition-colors"
                              style={{ background: active ? '#0060fd' : 'transparent', color: active ? '#ffffff' : '#8d9aa5' }}
                            >
                              {t === 'out' ? 'Sale' : 'Entra'}
                            </button>
                          )
                        })}
                      </div>
                      {subTab === 'out' ? (
                        <PlayerPickList players={starters} value={playerId} onSelect={selectPlayer} bookings={bookings} />
                      ) : (
                        <PlayerPickList
                          players={bench}
                          value={secondPlayerId}
                          onSelect={selectSecond}
                          placeholder="Buscar suplente..."
                          bookings={bookings}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 px-4 pb-3 short:flex short:w-[42%] short:min-w-[148px] short:flex-col short:justify-between short:border-l short:border-white/10 short:px-3 short:py-2">
                <div className="flex flex-col gap-3.5 short:gap-2.5">
                  {config.options && (
                    <div>
                      {config.optionsLabel && (
                        <p className="mb-1.5 text-sm font-semibold text-white short:mb-1 short:text-[12px]">{config.optionsLabel}</p>
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
                      <p className="mb-1.5 text-sm font-semibold text-white short:mb-1 short:text-[12px]">Asistencia (opcional)</p>
                      <SearchField placeholder="Buscar jugador..." />
                    </div>
                  )}

                  {config.showNote && (
                    <div>
                      <p className="mb-1.5 text-sm font-semibold text-white short:mb-1 short:text-[12px]">{config.noteLabel ?? 'Nota'}</p>
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

                <div className="mt-3.5 short:mt-2">
                  <DrawerFooter onCancel={onClose} onSubmit={handleSubmit} />
                </div>
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

