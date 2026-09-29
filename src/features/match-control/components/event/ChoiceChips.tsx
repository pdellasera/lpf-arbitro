import { cn } from '@/lib/cn'
import type { ChoiceOption } from '../../data/actionConfig'

interface ChoiceChipsProps {
  options: ChoiceOption[]
  value: string | null
  onSelect: (id: string) => void
}

export function ChoiceChips({ options, value, onSelect }: ChoiceChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={cn(
              'h-10 rounded-lg px-3.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-[#0060fd] text-white'
                : 'border border-[#2f3744] bg-[#061625] text-[#a3b1c1] hover:border-white/30',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
