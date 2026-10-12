import { Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MatchStartDelay, YesNoValue } from '../data/matchStartDelays'
import { YesNoToggle } from './YesNoToggle'

export type DelayPeriod = 'first' | 'second'

interface DelaysCardProps {
  delays: MatchStartDelay[]
  values: Record<string, YesNoValue>
  periods: Record<string, DelayPeriod[]>
  onChange: (id: string, value: YesNoValue) => void
  onPeriodToggle: (id: string, period: DelayPeriod) => void
}

/** Tarjeta "Retrasos durante el partido": tres preguntas Sí/No + periodo(s) del retraso. */
export function DelaysCard({ delays, values, periods, onChange, onPeriodToggle }: DelaysCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-soft">
          <Clock className="h-5 w-5 text-orange" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[19px] font-extrabold leading-tight tracking-tight text-ink">
            Retrasos durante el partido
          </h2>
          <p className="mt-1 text-[14px] leading-snug text-ink-soft">
            Indique si hubo retrasos o situaciones que afectaron el inicio del partido.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {delays.map((delay) => {
          const value = values[delay.id] ?? delay.defaultValue
          const period = periods[delay.id] ?? []
          return (
            <div
              key={delay.id}
              data-start-delay={delay.id}
              className="rounded-xl border border-line bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-blue-soft">
                  <delay.icon className="h-5 w-5 text-brand" />
                </span>
                <p className="min-w-0 flex-1 text-[15px] font-bold leading-tight text-ink">{delay.label}</p>
                <YesNoToggle
                  value={value}
                  onSelect={(selected) => onChange(delay.id, selected)}
                />
              </div>

              {value === 'yes' && (
                <div data-start-delay-period={delay.id} className="mt-3 border-t border-line pt-3">
                  <p className="text-[14px] font-bold text-ink">¿En qué periodo fue el retraso?</p>
                  <div className="mt-2 flex gap-2">
                    {(['first', 'second'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        data-start-period-option={option}
                        aria-pressed={period.includes(option)}
                        onClick={() => onPeriodToggle(delay.id, option)}
                        className={cn(
                          'h-9 flex-1 rounded-lg px-4 text-[14px] font-bold transition-colors',
                          period.includes(option)
                            ? 'border border-accent-green bg-accent-green-soft text-accent-green'
                            : 'border border-transparent bg-badge-gray text-badge-gray-ink',
                        )}
                      >
                        {option === 'first' ? 'Primer tiempo' : 'Segundo tiempo'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

