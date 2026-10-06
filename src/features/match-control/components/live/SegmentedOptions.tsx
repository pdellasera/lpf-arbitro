import { cn } from '@/lib/cn'
import type { ChoiceOption } from '../../data/actionConfig'

interface SegmentedOptionsProps {
  options: ChoiceOption[]
  value: string | null
  onSelect: (id: string) => void
}

/** Fila de opciones segmentadas (p. ej. "Juego abierto · Penal · Tiro libre"). */
export function SegmentedOptions({ options, value, onSelect }: SegmentedOptionsProps) {
  return (
    <div className="flex gap-2.5">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            data-segmented={o.id}
            aria-pressed={active}
            onClick={() => onSelect(o.id)}
            className={cn(
              'h-[52px] flex-1 rounded-xl px-2 text-[14px] font-semibold transition-all',
              active
                ? o.tone === 'yellow'
                  ? 'bg-card-yellow text-[#2a2405] shadow-[0_4px_14px_rgba(220,185,10,0.4)]'
                  : o.tone === 'red'
                    ? 'bg-pick text-white shadow-[0_4px_14px_rgba(200,3,19,0.35)]'
                    : 'bg-brand text-white shadow-[0_4px_14px_rgba(0,98,253,0.35)]'
                : 'border border-line bg-white text-brand shadow-[0_2px_6px_rgba(15,23,42,0.07)]',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
