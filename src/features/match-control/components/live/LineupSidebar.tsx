import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { LiveMatch } from '../../types'
import { AlineacionesTab } from './LiveTabsContent'

interface LineupSidebarProps {
  open: boolean
  match: LiveMatch
  onClose: () => void
}

/** Panel lateral con las alineaciones de ambos equipos (accesible desde la cabecera). */
export function LineupSidebar({ open, match, onClose }: LineupSidebarProps) {
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
            data-lineup-sidebar
            role="dialog"
            aria-label="Alineaciones"
            className="absolute inset-y-0 right-0 z-50 flex w-[min(88vw,360px)] flex-col overflow-hidden bg-page shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-line bg-white px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <h2 className="text-[17px] font-bold leading-none tracking-tight text-ink">Alineaciones</h2>
              <button
                type="button"
                aria-label="Cerrar alineaciones"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-mute hover:bg-line/60"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <AlineacionesTab match={match} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
