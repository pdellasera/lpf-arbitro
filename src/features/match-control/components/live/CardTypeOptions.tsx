import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ChoiceOption } from '../../data/actionConfig'

interface CardTypeOptionsProps {
  options: ChoiceOption[]
  value: string | null
  onSelect: (id: string) => void
}

/** Icono de cada tipo de tarjeta: círculo amarillo con "+" o carta roja. */
function OptionIcon({ tone }: { tone?: ChoiceOption['tone'] }) {
  if (tone === 'red') {
    return <span className="h-8 w-[22px] shrink-0 rounded-[4px] bg-pick" />
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5c518]">
      <Plus className="h-5 w-5 text-white" strokeWidth={3} />
    </span>
  )
}

/** Tarjetas de opción estilo mockup (p. ej. "Amarilla / Roja") con icono + label. */
export function CardTypeOptions({ options, value, onSelect }: CardTypeOptionsProps) {
  return (
    <div className="flex gap-3">
      {options.map((o) => {
        const active = o.id === value
        const red = o.tone === 'red'
        return (
          <button
            key={o.id}
            type="button"
            data-cardtype={o.id}
            aria-pressed={active}
            onClick={() => onSelect(o.id)}
            className={cn(
              'flex h-[64px] flex-1 items-center justify-center gap-3 rounded-2xl border-2 transition-all active:scale-[0.98]',
              active
                ? red
                  ? 'border-pick bg-[#fdecea]'
                  : 'border-[#f5cd44] bg-[#fdf3c9]'
                : 'border-line bg-white shadow-[0_2px_6px_rgba(15,23,42,0.07)]',
            )}
          >
            <OptionIcon tone={o.tone} />
            <span className={cn('text-[16px] font-semibold', active ? (red ? 'text-pick' : 'text-[#c9930b]') : 'text-ink')}>
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
