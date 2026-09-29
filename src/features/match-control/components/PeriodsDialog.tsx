import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { MatchPeriod } from '../types'

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface PeriodsDialogProps {
  open: boolean
  periods: MatchPeriod[]
  onClose: () => void
}

export function PeriodsDialog({ open, periods, onClose }: PeriodsDialogProps) {
  const closed = periods.filter((p) => p.endSeconds > 0)
  const totalSeconds = closed.reduce((acc, p) => acc + (p.endSeconds - p.startSeconds), 0)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#001222] p-5 shadow-2xl ring-1 ring-white/10"
            role="dialog"
            aria-label="Registro de partes"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Registro de partes</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#80838e] hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {periods.map((p) => {
                const open = p.endSeconds === 0
                const added = Math.round(p.addedSeconds / 60)
                return (
                  <div key={p.id} className="rounded-xl bg-[#0d1f32] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{p.label}</span>
                      <span className="text-xs font-semibold text-white/50">
                        {open
                          ? 'En curso'
                          : `${formatClock(p.startSeconds)} → ${formatClock(p.endSeconds)}`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {open ? 'Sin cerrar' : added > 0 ? `Tiempo añadido +${added}'` : 'Sin tiempo añadido'}
                    </p>
                  </div>
                )
              })}

              {periods.length === 0 && (
                <p className="py-4 text-center text-sm text-white/50">Aún no hay partes registradas.</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-semibold text-white/70">Total jugado</span>
              <span className="text-base font-extrabold tabular-nums text-white">
                {formatClock(totalSeconds)}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
