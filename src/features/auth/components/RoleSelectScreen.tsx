import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import background from '@/assets/login_background.webp'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { VersionTag } from '@/components/ui/VersionTag'
import { AuthHeader } from './AuthHeader'
import { useAppVersion } from '../hooks/useAppVersion'

interface RoleSelectScreenProps {
  onSelect: (role: 'arbitro' | 'comisionado') => void
}

export function RoleSelectScreen({ onSelect }: RoleSelectScreenProps) {
  const version = useAppVersion()

  return (
    <div className="relative app-h flex w-full flex-col bg-[#04121f]">
      <img
        src={background}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

      <main className="relative z-10 mx-auto my-auto flex w-full max-w-[400px] flex-col px-5 safe-y sm:px-6 md:max-w-[440px]">
        <AuthHeader />
        <div className="mt-8 w-full md:mt-11">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.6, ease: 'easeOut' }}
            className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e314a] to-[#081a2c] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:p-8"
          >
            <div className="mb-6">
              <h2 className="text-[20px] font-bold leading-tight text-white md:text-[22px]">
                Selecciona tu aplicación
              </h2>
            </div>

            <div className="flex flex-col gap-4 md:gap-5">
              <PrimaryButton onClick={() => onSelect('arbitro')}>App Árbitro</PrimaryButton>
              <SecondaryButton
                onClick={() => onSelect('comisionado')}
                icon={<ClipboardList className="h-5 w-5 text-[#3c84e8]" />}
              >
                App Comisionado
              </SecondaryButton>
            </div>

            <div className="mt-7">
              <VersionTag version={version.data?.version ?? 'v1.0.0'} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
