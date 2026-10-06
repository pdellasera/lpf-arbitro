import { Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MatchStartDelay, YesNoValue } from '../data/matchStartDelays'

interface DelaysCardProps {
  delays: MatchStartDelay[]
  values: Record<string, YesNoValue>
  onChange: (id: string, value: YesNoValue) => void
}

function YesNoToggle({
  value,
  onSelect,
}: {
  value: YesNoValue
  onSelect: (value: YesNoValue) => void
}) {
  const base = 'h-9 rounded-lg px-4 text-[14px] font-bold transition-colors'
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        data-start-option="yes"
        aria-pressed={value === 'yes'}
        onClick={() => onSelect('yes')}
        className={cn(
          base,
          value === 'yes'
            ? 'border border-accent-green bg-accent-green-soft text-accent-green'
            : 'border border-transparent bg-badge-gray text-badge-gray-ink',
        )}
      >
        Sí
      </button>
      <button
        type="button"
        data-start-option="no"
        aria-pressed={value === 'no'}
        onClick={() => onSelect('no')}
        className={cn(
          base,
          value === 'no'
            ? 'border border-danger bg-danger-soft text-danger'
            : 'border border-transparent bg-badge-gray text-badge-gray-ink',
        )}
      >
        No
      </button>
    </div>
  )
}

/** Tarjeta "Retrasos durante el partido": tres preguntas Sí/No. */
export function DelaysCard({ delays, values, onChange }: DelaysCardProps) {
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
        {delays.map((delay) => (
          <div
            key={delay.id}
            data-start-delay={delay.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-blue-soft">
              <delay.icon className="h-5 w-5 text-brand" />
            </span>
            <p className="min-w-0 flex-1 text-[15px] font-bold leading-tight text-ink">{delay.label}</p>
            <YesNoToggle
              value={values[delay.id] ?? delay.defaultValue}
              onSelect={(value) => onChange(delay.id, value)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
