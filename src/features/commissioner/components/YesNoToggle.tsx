import { cn } from '@/lib/cn'
import type { YesNoValue } from '../data/matchStartDelays'

interface YesNoToggleProps {
  value: YesNoValue
  onSelect: (value: YesNoValue) => void
}

/** Toggle Sí/No reutilizable (retrasos, similitud de uniformes). */
export function YesNoToggle({ value, onSelect }: YesNoToggleProps) {
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
