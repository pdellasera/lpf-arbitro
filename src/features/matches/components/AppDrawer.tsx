import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, UserRound, X } from 'lucide-react'
import { useSession } from '@/features/auth/SessionProvider'

interface AppDrawerProps {
  open: boolean
  onClose: () => void
}

export function AppDrawer({ open, onClose }: AppDrawerProps) {
  const { session, signOut } = useSession()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 42 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[78%] max-w-[320px] flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <UserRound className="h-5 w-5 text-brand" />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-ink">{session?.user.name ?? 'Árbitro LPF'}</p>
                  <p className="text-[12px] text-ink-soft">
                    {session?.user.role === 'comisionado' ? 'Comisionado LPF' : 'Árbitro LPF'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="rounded-full p-2 text-ink-soft hover:bg-page"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1" />

            <div className="border-t border-line px-3 py-3">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-[#e5484d] hover:bg-[#fdf0f0]"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
