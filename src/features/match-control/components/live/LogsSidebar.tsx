import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { EventKind, LiveMatch } from '../../types'

interface LogsSidebarProps {
  open: boolean
  match: LiveMatch
  onClose: () => void
}

const KIND_META: Record<EventKind, { label: string; color: string }> = {
  goal: { label: 'Gol', color: '#05b56b' },
  yellow: { label: 'Tarjeta amarilla', color: '#dcb90a' },
  red: { label: 'Tarjeta roja', color: '#c80313' },
  sub: { label: 'Cambio', color: '#00c258' },
  incident: { label: 'Incidente', color: '#6c1be7' },
  foul: { label: 'Falta', color: '#f59e0b' },
  freekick: { label: 'Tiro libre', color: '#0ea5e9' },
  corner: { label: 'Tiro de esquina', color: '#0ea5e9' },
  penalty: { label: 'Penal', color: '#f59e0b' },
  'goal-disallowed': { label: 'Gol anulado', color: '#ef4444' },
  var: { label: 'VAR', color: '#6366f1' },
  'added-time': { label: 'Tiempo añadido', color: '#94a3b8' },
  saque: { label: 'Saque de meta', color: '#64748b' },
  'half-end': { label: 'Fin de parte', color: '#94a3b8' },
}

export function LogsSidebar({ open, match, onClose }: LogsSidebarProps) {
  const events = [...match.events].reverse()
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            data-logs-sidebar
            role="dialog"
            aria-label="Logs"
            className="absolute inset-y-0 right-0 z-50 flex w-[min(82vw,320px)] flex-col overflow-hidden bg-[#001222] shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <h2 className="text-[17px] font-bold leading-none tracking-tight text-white">Logs</h2>
              <button
                type="button"
                aria-label="Cerrar logs"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#80838e] hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {events.length === 0 ? (
                <p className="py-10 text-center text-[14px] text-white/50">Sin eventos registrados</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {events.map((e) => {
                    const meta = KIND_META[e.kind]
                    return (
                      <div key={e.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3.5 py-3">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-white">{meta.label}</p>
                          {(e.reason || e.player) && (
                            <p className="truncate text-[12px] text-white/50">{e.reason ?? e.player}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-[13px] font-bold tabular-nums text-white/70">{e.minute}&#39;</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
