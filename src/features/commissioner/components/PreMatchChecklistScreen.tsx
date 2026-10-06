import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PRE_MATCH_CHECKLIST } from '../data/preMatchChecklist'
import { PreMatchTopBar } from './PreMatchTopBar'

interface PreMatchChecklistScreenProps {
  onBack: () => void
  onNext: () => void
}

/** Lista Previa (Antes del partido) del rol Comisionado: checklist de instalaciones y seguridad. */
export function PreMatchChecklistScreen({ onBack, onNext }: PreMatchChecklistScreenProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(PRE_MATCH_CHECKLIST.map((item) => [item.id, item.valueIndex])),
  )

  function cycle(id: string) {
    const item = PRE_MATCH_CHECKLIST.find((entry) => entry.id === id)
    if (!item || item.options.length < 2) return
    setValues((prev) => {
      const current = prev[id] ?? item.valueIndex
      return { ...prev, [id]: (current + 1) % item.options.length }
    })
  }

  return (
    <div data-pre className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <PreMatchTopBar onBack={onBack} />

      <main className="flex flex-1 flex-col overflow-hidden rounded-t-[28px] bg-page">
        <div className="flex-1 overflow-y-auto px-5 pt-6">
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-ink">Antes del partido</h1>
          <p className="mt-2 text-[15px] leading-snug text-ink-soft">
            Revisión de instalaciones y seguridad. Ya está marcado lo habitual; toque cualquiera para cambiarlo.
          </p>

          <div data-pre-pill className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-green-soft px-3 py-1.5">
            <span className="text-[13px] font-bold text-accent-green">Verificado en sitio</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {PRE_MATCH_CHECKLIST.map((item, index) => {
              const valueIndex = values[item.id] ?? item.valueIndex
              const subtitle = valueIndex >= 0 ? item.options[valueIndex] : null
              return (
                <button
                  key={item.id}
                  type="button"
                  data-pre-row={item.id}
                  onClick={() => cycle(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-badge-gray',
                    index > 0 && 'border-t border-line',
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                    {valueIndex >= 0 && (
                      <span data-pre-check className="flex h-full w-full items-center justify-center rounded-2xl bg-accent-green-soft">
                        <Check className="h-5 w-5 text-accent-green" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-bold leading-tight text-ink">{item.label}</span>
                    {subtitle && <span className="mt-0.5 block text-[14px] leading-tight text-ink-soft">{subtitle}</span>}
                  </span>
                  <span className="text-[15px] font-semibold text-brand">Cambiar</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex gap-3">
            <button
              type="button"
              data-pre-back
              onClick={onBack}
              aria-label="Volver"
              className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-badge-gray text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              data-pre-next
              onClick={onNext}
              className="flex h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(0,98,253,0.32)] transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Siguiente
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
