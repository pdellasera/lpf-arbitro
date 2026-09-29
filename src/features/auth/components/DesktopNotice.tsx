import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import background from '@/assets/login_background.webp'
import { LpfLogo } from '@/components/ui/LpfLogo'
import { VersionTag } from '@/components/ui/VersionTag'

export function DesktopNotice() {
  return (
    <div className="relative app-h flex w-full items-center justify-center overflow-hidden bg-[#04121f]">
      <img
        src={background}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#04121f]/60 via-[#04121f]/40 to-[#04121f]/90" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-6 text-center"
      >
        <LpfLogo className="h-20 w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />

        <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Smartphone className="h-8 w-8 text-[#6fa6ff]" />
        </div>

        <h1 className="mt-6 text-[24px] font-extrabold text-white">Disponible en móviles y tablets</h1>

        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#8ca0b5]">
          Esta aplicación está optimizada para dispositivos táctiles. Ábrela desde tu teléfono o tablet para
          continuar con el informe del árbitro.
        </p>

        <div className="mt-8">
          <VersionTag version="v1.0.0" />
        </div>
      </motion.div>
    </div>
  )
}