import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Lock, X } from 'lucide-react'
import { formatLongDate } from '@/features/matches/lib/formatDate'
import type { Match } from '@/features/matches/types'
import type { LiveMatch } from '../../types'
import { formatDuration, halfTimeScore, matchEndTime } from '../../lib/acta'
import { ActaSummaryCard } from './ActaSummaryCard'
import { ActaTopBar } from './ActaTopBar'
import { SignaturePad, type SignaturePadHandle } from './SignaturePad'

interface ActaFinalizacionScreenProps {
  match: Match
  live: LiveMatch
  seconds: number
  onBack: () => void
  onClose: () => void
  role: 'arbitro' | 'comisionado'
}

/** Pantalla que se muestra al finalizar el partido: resumen + firma (del árbitro o del comisionado según el rol). */
export function ActaFinalizacionScreen({
  match,
  live,
  seconds,
  onBack,
  onClose,
  role,
}: ActaFinalizacionScreenProps) {
  const padRef = useRef<SignaturePadHandle>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!confirmOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmOpen])

  const halfTime = halfTimeScore(live.events)
  const hasSecondHalf = live.periods.some((p) => p.half === 2)
  const endTime = matchEndTime(match.trailing, seconds, hasSecondHalf)
  const duration = formatDuration(live.periods)
  const dateLabel = match.date ? formatLongDate(match.date) : ''

  return (
    <div data-acta className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <ActaTopBar onBack={onBack} />

      <main className="flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white">
        <div className="flex-1 overflow-y-auto px-5 pt-6">
          <ActaSummaryCard
            home={live.home}
            away={live.away}
            score={live.score}
            halfTime={halfTime}
            dateLabel={dateLabel}
            startTime={match.trailing}
            endTime={endTime}
            duration={duration}
          />

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 data-acta-signature-title className="text-[16px] font-extrabold text-ink">
                {role === 'comisionado' ? 'Firma del Comisionado' : 'Firma del Árbitro'}
              </h3>
              <button
                type="button"
                data-acta-clear
                onClick={() => padRef.current?.clear()}
                className="text-[14px] font-bold text-brand transition-transform active:scale-95"
              >
                Limpiar
              </button>
            </div>
            <div className="mt-3">
              <SignaturePad ref={padRef} />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            data-acta-close
            onClick={() => setConfirmOpen(true)}
            className="flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-day-active text-[17px] font-extrabold text-ink shadow-[0_10px_24px_rgba(9,30,66,0.14)] transition-transform active:scale-[0.99]"
          >
            <Lock className="h-5 w-5" />
            Cerrar reporte de partido
          </button>
        </div>
      </main>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 30 } }}
              exit={{ scale: 0.96, y: 24, opacity: 0, transition: { duration: 0.15 } }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="acta-confirm-title"
              data-acta-confirm
              className="w-full max-w-[430px] overflow-hidden rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-badge-gray text-ink transition-transform active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 id="acta-confirm-title" className="mt-4 text-[20px] font-extrabold leading-tight tracking-tight text-ink">
                Cerrar reporte de partido
              </h2>
              <p className="mt-2 text-[15px] leading-snug text-ink-soft">
                Antes de cerrar el reporte, verifica que todo quedó completado correctamente. Una vez cerrado, el reporte no se puede editar.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  data-acta-confirm-cancel
                  className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-badge-gray text-[16px] font-bold text-ink transition-transform active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onClose()}
                  data-acta-confirm-accept
                  className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-day-active text-[16px] font-extrabold text-ink shadow-[0_10px_24px_rgba(9,30,66,0.14)] transition-transform active:scale-[0.97]"
                >
                  Cerrar reporte
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
