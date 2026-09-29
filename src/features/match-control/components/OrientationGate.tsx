import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { tryLockLandscape } from '../hooks/useOrientation'

export function OrientationGate() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#04121f] px-8 text-center">
      <motion.div
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        style={{ width: 96, height: 96 }}
      >
        <RotateCcw className="text-[#6fa6ff]" style={{ width: 44, height: 44 }} />
      </motion.div>

      <h1 className="mt-7 text-[24px] font-extrabold leading-tight text-white">Gira tu dispositivo</h1>
      <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-[#8ca0b5]">
        El control del partido en vivo solo está disponible en horizontal. Rota tu teléfono o tablet para continuar.
      </p>

      <button
        type="button"
        onClick={() => void tryLockLandscape()}
        className="mt-8 flex items-center gap-2 rounded-xl bg-[#0062fd] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1a74ff]"
      >
        <RotateCcw className="h-4 w-4" />
        Intentar rotar
      </button>
    </div>
  )
}
