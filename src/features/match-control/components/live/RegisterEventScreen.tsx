import { useEffect, useState, type ReactNode } from 'react'
import { ChevronRight, Minus, Plus, TriangleAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ActionConfig, ActionKind, ChoiceOption } from '../../data/actionConfig'
import type { EventDraft, LiveMatch, Side } from '../../types'
import { CardTypeOptions } from './CardTypeOptions'
import { EditScreenTopBar } from './EditScreenTopBar'
import { IncidentTypeOptions } from './IncidentTypeOptions'
import { PlayerSelect } from './PlayerSelect'
import { ScoreStrip } from './ScoreStrip'
import { SegmentedOptions } from './SegmentedOptions'

interface RegisterEventScreenProps {
  open: boolean
  config: ActionConfig
  match: LiveMatch
  minute: number
  selectedPlayerId: string | null
  /** Opción preseleccionada al abrir (p. ej. color de tarjeta o tipo de incidente). */
  presetOption?: string
  onSelectPlayer: (id: string) => void
  onClose: () => void
  onSelectAction: (id: ActionKind) => void
  onSubmit: (draft: EventDraft) => void
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2.5 text-[16px] font-bold text-ink">{children}</p>
}

export function RegisterEventScreen({
  open,
  config,
  match,
  minute,
  selectedPlayerId,
  presetOption,
  onSelectPlayer,
  onClose,
  onSelectAction,
  onSubmit,
}: RegisterEventScreenProps) {
  const [side, setSide] = useState<Side | 'neutral'>('home')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [secondPlayerId, setSecondPlayerId] = useState<string | null>(null)
  const [option, setOption] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [addedMinutes, setAddedMinutes] = useState(0)
  const [minuteValue, setMinuteValue] = useState(0)

  const starters = match.players.filter((p) => p.side === side && p.starter)
  const bench = match.players.filter((p) => p.side === side && !p.starter)

  // Resetea el formulario cada vez que se abre (o cambia la acción preseleccionada).
  useEffect(() => {
    if (!open) return
    const homeStarter = match.players.find((p) => p.side === 'home' && p.starter)
    const initial = selectedPlayerId ?? homeStarter?.id ?? null
    setPlayerId(initial)
    setSecondPlayerId(null)
    setOption(presetOption ?? null)
    setReason('')
    setNote('')
    setAddedMinutes(0)
    setMinuteValue(minute)
    setSide(initial ? (match.players.find((p) => p.id === initial)?.side ?? 'home') : 'home')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetOption, config.id])

  function selectPlayer(id: string) {
    setPlayerId(id)
    const p = match.players.find((x) => x.id === id)
    if (p) setSide(p.side)
    onSelectPlayer(id)
  }

  function changeSide(s: Side | 'neutral') {
    setSide(s)
    setPlayerId(null)
    setSecondPlayerId(null)
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
      minute: minuteValue,
      option: option ?? undefined,
      reason: reason || undefined,
      note: note || undefined,
      addedMinutes,
    })
  }

  const submitLabel = config.submitLabel ?? `Guardar ${config.label.toLowerCase()}`

  // Opciones visibles: si viene con preset y es de elección única, se oculta el resto.
  const options = config.singleChoice && presetOption && config.options
    ? config.options.filter((o) => o.id === presetOption)
    : config.options

  const selectedPlayer = playerId ? match.players.find((p) => p.id === playerId) : undefined
  const yellowCount = selectedPlayer
    ? match.events.filter((e) => e.playerId === playerId && e.kind === 'yellow').length
    : 0
  const showExpulsion = option === 'yellow' && yellowCount >= 1

  const sideOptions: ChoiceOption[] = config.sideNeutral
    ? [
        { id: 'home', label: match.home.name },
        { id: 'away', label: match.away.name },
        { id: 'neutral', label: 'General' },
      ]
    : [
        { id: 'home', label: match.home.name },
        { id: 'away', label: match.away.name },
      ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-drawer
          role="dialog"
          aria-modal="true"
          aria-label={config.title}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          className="app-h fixed inset-0 z-50 flex flex-col bg-header-bottom"
        >
          <EditScreenTopBar title={config.title} onBack={onClose} />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto">
            <ScoreStrip home={match.home} away={match.away} score={match.score} />
            <div className="flex flex-col gap-5 px-5 pb-8">
              {config.moreItems ? (
                <div className="flex flex-col gap-2">
                  {config.moreItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectAction(item.id)}
                      className="flex h-[52px] w-full items-center justify-between rounded-xl border border-line bg-white px-4 text-[15px] font-semibold text-ink active:scale-[0.99]"
                    >
                      {item.label}
                      <ChevronRight className="h-5 w-5 text-ink-mute" />
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-ink">Minuto</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        data-minute-minus
                        onClick={() => setMinuteValue((m) => Math.max(0, m - 1))}
                        aria-label="Restar minuto"
                        className="flex h-11 w-12 items-center justify-center rounded-xl border border-line bg-white text-ink transition-transform active:scale-95"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span data-minute className="min-w-[44px] text-center text-[16px] font-bold tabular-nums text-ink">
                        {minuteValue}'
                      </span>
                      <button
                        type="button"
                        data-minute-plus
                        onClick={() => setMinuteValue((m) => m + 1)}
                        aria-label="Sumar minuto"
                        className="flex h-11 w-12 items-center justify-center rounded-xl border border-line bg-white text-ink transition-transform active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {config.showSide && (!config.showPlayers || config.showSecondPlayers) && (
                    <div>
                      <FieldLabel>{config.sideLabel ?? 'Equipo'}</FieldLabel>
                      <SegmentedOptions
                        options={sideOptions}
                        value={side}
                        onSelect={(id) => changeSide(id as Side | 'neutral')}
                      />
                    </div>
                  )}

                  {config.showPlayers && (
                    <div>
                      <FieldLabel>{config.showSecondPlayers ? 'Jugador que sale' : 'Jugador'}</FieldLabel>
                      <PlayerSelect
                        players={config.showSecondPlayers ? starters : match.players}
                        value={playerId}
                        onSelect={selectPlayer}
                        icon={config.showSecondPlayers ? 'out' : undefined}
                      />
                    </div>
                  )}

                  {config.showSecondPlayers && (
                    <div>
                      <FieldLabel>{config.secondLabel ?? 'Jugador que ingresa'}</FieldLabel>
                      <PlayerSelect players={bench} value={secondPlayerId} onSelect={setSecondPlayerId} icon="in" />
                    </div>
                  )}

                  {options && (
                    <div>
                      {config.optionsLabel && <FieldLabel>{config.optionsLabel}</FieldLabel>}
                      {config.optionsStyle === 'cards' ? (
                        <CardTypeOptions options={options} value={option} onSelect={setOption} />
                      ) : config.optionsStyle === 'list' ? (
                        <IncidentTypeOptions options={options} value={option} onSelect={setOption} />
                      ) : (
                        <SegmentedOptions options={options} value={option} onSelect={setOption} />
                      )}
                    </div>
                  )}

                  {config.showReason && (
                    <div>
                      <FieldLabel>{config.reasonLabel ?? 'Motivo'}</FieldLabel>
                      <input
                        type="text"
                        data-reason
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={config.reasonPlaceholder ?? 'Escribe el motivo…'}
                        className="h-[52px] w-full rounded-xl border border-line bg-white px-4 text-[15px] font-semibold text-ink shadow-[0_2px_6px_rgba(15,23,42,0.08)] outline-none placeholder:text-ink-mute focus:border-brand focus:shadow-[0_2px_8px_rgba(0,98,253,0.15)]"
                      />
                    </div>
                  )}

                  {config.showAssist && (
                    <div>
                      <FieldLabel>Asistencia (opcional)</FieldLabel>
                      <PlayerSelect players={match.players} value={null} onSelect={() => {}} />
                    </div>
                  )}

                  {config.showNote && (
                    <div>
                      <FieldLabel>{config.noteLabel ?? 'Nota'}</FieldLabel>
                      <textarea
                        data-note
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder={config.notePlaceholder ?? 'Escribe aquí…'}
                        className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink shadow-[0_2px_6px_rgba(15,23,42,0.08)] outline-none placeholder:text-ink-mute focus:border-brand focus:shadow-[0_2px_8px_rgba(0,98,253,0.15)]"
                      />
                    </div>
                  )}

                  {config.showAddedMinutes && (
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-bold text-ink">Tiempo añadido (min)</span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setAddedMinutes((n) => Math.max(0, n - 1))}
                          aria-label="Restar minuto"
                          className="flex h-11 w-12 items-center justify-center rounded-xl border border-line bg-white text-ink"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[34px] text-center text-[16px] font-bold tabular-nums text-ink">
                          {addedMinutes}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddedMinutes((n) => n + 1)}
                          aria-label="Sumar minuto"
                          className="flex h-11 w-12 items-center justify-center rounded-xl border border-line bg-white text-ink"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {!config.moreItems && (
            <div className="sticky bottom-0 z-10 shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {showExpulsion && selectedPlayer && (
                <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-pick/30 bg-[#fdecea] px-4 py-3">
                  <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-pick" />
                  <p className="text-[14px] font-semibold leading-snug text-pick">
                    Expulsado {selectedPlayer.name} por acumulación de tarjeta amarilla
                  </p>
                </div>
              )}
              <button
                type="button"
                data-save
                onClick={handleSubmit}
                className="h-[58px] w-full rounded-xl bg-day-active text-[17px] font-bold text-ink shadow-[0_8px_20px_rgba(247,206,30,0.45)] transition-transform active:scale-[0.98]"
              >
                {submitLabel}
              </button>
            </div>
          )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
