import { motion } from 'framer-motion'
import { LpfLogo } from '@/components/ui/LpfLogo'

export function AuthHeader() {
  return (
    <header className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <LpfLogo className="h-16 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="mt-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/90"
      >
        Informe del
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5, ease: 'easeOut' }}
        className="mt-1 text-[30px] font-extrabold uppercase leading-none tracking-[0.03em] text-white"
      >
        Árbitro
      </motion.h1>
    </header>
  )
}
