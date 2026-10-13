import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { PreMatchItem } from '../data/preMatchChecklist'

interface PreMatchItemModalProps {
  open: boolean
  item: PreMatchItem | null
  valueIndex: number
  observation: string
  onClose: () => void
  onSave: (valueIndex: number, observation: string) => void
}

/** Modal del ítem del checklist: elige la opción de valor y permite escribir una observación. */
export function PreMatchItemModal({
  open,
  item,
  valueIndex,
  observation,
  onClose,
  onSave,
}: PreMatchItemModalProps) {
  const [selected, setSelected] = useState(valueIndex)
  const [note, setNote] = useState(observation)

  useEffect(() => {
    if (!open) return
    setSelected(valueIndex)
    setNote(observation)
  }, [open, item, valueIndex, observation])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const canSave = selected >= 0 || note.trim() !== ''

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 30 } }}
            exit={{ scale: 0.96, y: 24, opacity: 0, transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pre-item-modal-title"
            data-pre-modal
            className="w-full max-w-[430px] overflow-hidden rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="pre-item-modal-title" className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
                {item.label}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-gray text-ink transition-transform active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {item.options.map((option, index) => {
                const active = index === selected
                return (
                  <button
                    key={option}
                    type="button"
                    data-pre-option={index}
                    aria-pressed={active}
                    onClick={() => setSelected(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors active:scale-[0.99]',
                      active ? 'border-accent-green bg-accent-green-soft' : 'border-line bg-white',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                        active ? 'border-accent-green bg-accent-green' : 'border-line bg-white',
                      )}
                    >
                      {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-[15px] font-semibold text-ink">{option}</span>
                  </button>
                )
              })}
            </div>

            <label htmlFor="pre-item-note" className="mt-5 block text-[14px] font-bold text-ink">
              Observación
            </label>
            <textarea
              id="pre-item-note"
              data-pre-note
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Escribe una observación…"
              className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink shadow-[0_2px_6px_rgba(15,23,42,0.08)] outline-none placeholder:text-ink-mute focus:border-brand focus:shadow-[0_2px_8px_rgba(0,98,253,0.15)]"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                data-pre-cancel
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-badge-gray text-[16px] font-bold text-ink transition-transform active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onSave(selected, note)}
                data-pre-save
                disabled={!canSave}
                aria-disabled={!canSave}
                className={cn(
                  'flex h-[52px] flex-1 items-center justify-center rounded-xl bg-brand text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(0,98,253,0.32)] transition-transform active:scale-[0.97]',
                  !canSave && 'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                )}
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
