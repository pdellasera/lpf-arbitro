import { useEffect, type ReactNode } from 'react'
import { ChevronRight, Crosshair, Ellipsis, Flag, Hand, Play, Repeat2, Volleyball, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ACTIONS, RAIL_ORDER, type ActionKind } from '../data/actionConfig'

function RailGlyph({ id, active }: { id: ActionKind; active: boolean }) {
  switch (id) {
    case 'goal':
      return <Volleyball className="h-5 w-5 text-white short:h-4 short:w-4" />
    case 'card':
      return <span className={cn('h-[18px] w-[14px] rounded-[3px] short:h-[14px] short:w-[11px]', active ? 'bg-white' : 'bg-[#dcb90a]')} />
    case 'sub':
      return <Repeat2 className={cn('h-5 w-5 short:h-4 short:w-4', active ? 'text-white' : 'text-[#00c258]')} />
    case 'incident':
      return (
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md short:h-5 short:w-5', active ? 'bg-white' : 'bg-[#6c1be7]')}>
          <Play className={cn('h-3 w-3 short:h-2.5 short:w-2.5', active ? 'text-[#6c1be7]' : 'text-white')} />
        </span>
      )
    case 'foul':
      return <Crosshair className="h-5 w-5 text-white short:h-4 short:w-4" />
    case 'freekick':
      return <Hand className="h-5 w-5 text-white short:h-4 short:w-4" />
    case 'corner':
      return <Flag className="h-5 w-5 text-white short:h-4 short:w-4" />
    default:
      return <Ellipsis className="h-5 w-5 text-white short:h-4 short:w-4" />
  }
}

interface RefereeActionRailProps {
  open: boolean
  active: ActionKind
  onSelect: (id: ActionKind) => void
  onOpen: () => void
  onClose: () => void
  header?: ReactNode
}

export function RefereeActionRail({ open, active, onSelect, onOpen, onClose, header }: RefereeActionRailProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* Trigger flotante: solo la acción activa, sobre la tribuna lateral. */}
      <div
        className="pointer-events-none absolute z-20 flex w-fit items-center"
        style={{
          left: 'max(var(--live-gap), env(safe-area-inset-left))',
          top: 'calc(var(--live-header-h) + max(var(--live-gap), env(safe-area-inset-top)) + var(--live-gap))',
          bottom: 'calc(var(--live-timeline-h) + max(var(--live-gap), env(safe-area-inset-bottom)) + var(--live-gap))',
        }}
      >
        <button
          type="button"
          data-rail-trigger
          onClick={onOpen}
          aria-expanded={open}
          aria-controls="referee-actions"
          aria-label={`Acciones · ${ACTIONS[active].label}`}
          title={`Acciones · ${ACTIONS[active].label}`}
          className="pointer-events-auto flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#0f2135]/90 text-white ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-[#0f2135]"
          style={{ width: 'var(--live-rail-trigger)', height: 'var(--live-rail-trigger)' }}
        >
          <RailGlyph id={active} active={false} />
          <ChevronRight className="h-3 w-3 text-white/70" />
        </button>
      </div>

      {/* Sidebar modal: backdrop + panel sobre la cancha. */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="rail-backdrop"
              data-rail-backdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
            />

            <motion.aside
              key="rail-panel"
              data-rail
              id="referee-actions"
              role="dialog"
              aria-modal="true"
              aria-label="Acciones del árbitro"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute z-40 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#001222]/95 shadow-2xl backdrop-blur"
              style={{
                left: 'max(var(--live-gap), env(safe-area-inset-left))',
                top: 'calc(var(--live-header-h) + max(var(--live-gap), env(safe-area-inset-top)) + var(--live-gap))',
                bottom: 'calc(var(--live-timeline-h) + max(var(--live-gap), env(safe-area-inset-bottom)) + var(--live-gap))',
                width: 'var(--live-sheet-w)',
              }}
            >
              <div className="flex shrink-0 items-start gap-2 p-1.5 pb-0">
                <div className="min-w-0 flex-1">{header}</div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar acciones"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f2135]/80 text-white/70 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 2×4 en pantallas altas, 4×2 en `short` (móvil horizontal). */}
              <div
                className="grid flex-1 grid-cols-2 gap-1.5 p-1.5 short:grid-cols-4 short:gap-1 short:p-1"
                style={{ gridAutoRows: '1fr' }}
              >
                {RAIL_ORDER.map((id) => {
                  const isActive = id === active
                  return (
                    <button
                      key={id}
                      type="button"
                      data-action={id}
                      onClick={() => onSelect(id)}
                      title={ACTIONS[id].label}
                      aria-label={ACTIONS[id].label}
                      className={cn(
                        'flex min-h-[40px] flex-col items-center justify-center gap-1 rounded-xl px-2 text-center transition-colors short:min-h-[38px] short:gap-0.5 short:px-1',
                        isActive ? 'bg-[#0060fd]' : 'bg-[#0f2135]/75 hover:bg-[#0f2135]',
                      )}
                    >
                      <RailGlyph id={id} active={isActive} />
                      <span className={cn('text-[13px] font-semibold leading-tight short:text-[10px] short:leading-[1.15]', isActive ? 'text-white' : 'text-white/95')}>
                        {ACTIONS[id].shortLabel ? (
                          <>
                            <span className="short:hidden">{ACTIONS[id].label}</span>
                            <span className="hidden short:inline">{ACTIONS[id].shortLabel}</span>
                          </>
                        ) : (
                          ACTIONS[id].label
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
