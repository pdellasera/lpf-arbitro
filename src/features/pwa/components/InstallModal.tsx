import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Loader2, Maximize, Rocket, WifiOff, X, type LucideIcon } from 'lucide-react'
import { LpfLogo } from '@/components/ui/LpfLogo'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import type { InstallOutcome, InstallPlatform, UnavailableReason } from '../types'
import { InstallInstructions } from './InstallInstructions'

interface InstallModalProps {
  open: boolean
  platform: InstallPlatform
  canPrompt: boolean
  promptUnavailable: boolean
  promptSupported: boolean
  unavailableReason: UnavailableReason | null
  onInstall: () => Promise<InstallOutcome>
  onRetry: () => Promise<InstallOutcome>
  onLater: () => void
}

const BENEFITS: Array<{ Icon: LucideIcon; label: string }> = [
  { Icon: Maximize, label: 'Pantalla completa' },
  { Icon: WifiOff, label: 'Sin conexión' },
  { Icon: Rocket, label: 'Acceso directo' },
]

function UnavailableNote({ reason }: { reason: UnavailableReason | null }) {
  const text =
    reason === 'insecure'
      ? 'Para la instalación automática, abre la app desde https:// o localhost.'
      : reason === 'no-sw'
        ? 'El instalador automático necesita el service worker. Usa el build de producción (npm run preview).'
        : 'Tu navegador no ofrece el instalador automático aquí. Usa los pasos de abajo.'
  return (
    <p className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-center text-[12px] leading-relaxed text-amber-100/90">
      {text}
    </p>
  )
}

export function InstallModal({
  open,
  platform,
  canPrompt,
  promptUnavailable,
  promptSupported,
  unavailableReason,
  onInstall,
  onRetry,
  onLater,
}: InstallModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onLater()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onLater])

  // Android: el botón de instalar siempre existe. Si el prompt nativo no llega,
  // al pulsarlo se reintenta y, si sigue sin estar disponible, se muestran los pasos manuales.
  const [manualOpen, setManualOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setManualOpen(false)
      setBusy(false)
    }
  }, [open])

  const handleAndroidInstall = async () => {
    setBusy(true)
    const outcome = await onRetry()
    setBusy(false)
    if (outcome !== 'accepted') setManualOpen(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.35 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={onLater}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              transition: { type: 'spring', stiffness: 320, damping: 30, delay: 0.35 },
            }}
            exit={{ scale: 0.94, y: 16, opacity: 0, transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-modal-title"
            className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#001222] p-5 shadow-2xl ring-1 ring-white/10"
          >
            <div className="flex items-start justify-between">
              <LpfLogo className="h-12 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
              <button
                type="button"
                onClick={onLater}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#80838e] hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 id="install-modal-title" className="mt-3 text-[22px] font-extrabold leading-tight text-white">
              Instala la aplicación
            </h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#8ca0b5]">
              Para que el sistema funcione correctamente es necesario instalar la aplicación.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {BENEFITS.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2 py-3"
                >
                  <Icon className="h-5 w-5 text-[#6fa6ff]" />
                  <span className="text-center text-[11px] font-medium leading-tight text-white/80">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              {canPrompt ? (
                <PrimaryButton onClick={onInstall} icon={<Download className="h-5 w-5" />}>
                  Instalar ahora
                </PrimaryButton>
              ) : platform === 'android' ? (
                promptSupported && !promptUnavailable ? (
                  <PrimaryButton disabled icon={<Loader2 className="h-5 w-5 animate-spin" />}>
                    Preparando instalador…
                  </PrimaryButton>
                ) : busy ? (
                  <PrimaryButton disabled icon={<Loader2 className="h-5 w-5 animate-spin" />}>
                    Abriendo instalador…
                  </PrimaryButton>
                ) : manualOpen ? (
                  <>
                    <UnavailableNote reason={unavailableReason} />
                    <InstallInstructions platform="android" />
                  </>
                ) : (
                  <PrimaryButton onClick={handleAndroidInstall} icon={<Download className="h-5 w-5" />}>
                    Instalar aplicación
                  </PrimaryButton>
                )
              ) : (
                <>
                  <p className="text-center text-[13px] font-semibold text-white/70">
                    Tu navegador no ofrece instalación automática
                  </p>
                  <InstallInstructions platform={platform} />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onLater}
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 py-3 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-white/10"
            >
              Más tarde
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
