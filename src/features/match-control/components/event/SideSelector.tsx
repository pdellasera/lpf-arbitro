import { cn } from '@/lib/cn'
import type { Side } from '../../types'

interface SideSelectorProps {
  value: Side | 'neutral'
  onSelect: (s: Side | 'neutral') => void
  neutral?: boolean
}

export function SideSelector({ value, onSelect, neutral }: SideSelectorProps) {
  const options: { id: Side | 'neutral'; label: string }[] = neutral
    ? [
        { id: 'home', label: 'Local' },
        { id: 'away', label: 'Visitante' },
        { id: 'neutral', label: 'General' },
      ]
    : [
        { id: 'home', label: 'Local' },
        { id: 'away', label: 'Visitante' },
      ]

  return (
    <div className="flex gap-1 rounded-xl bg-[#07172b] p-1">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={cn('h-10 flex-1 rounded-lg text-center text-sm font-semibold transition-colors short:h-9 short:text-[13px]')}
            style={{
              background: active ? '#0060fd' : 'transparent',
              color: active ? '#ffffff' : '#8d9aa5',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
