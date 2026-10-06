import { cn } from '@/lib/cn'
import type { MatchDay } from '../types'

interface DaySelectorProps {
  days: MatchDay[]
  selected: string
  onSelect: (date: string) => void
}

export function DaySelector({ days, selected, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-2.5 px-4">
      {days.map((day) => {
        const active = day.date === selected
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            className={cn(
              'flex flex-1 snap-start flex-col items-center rounded-2xl px-3 py-2.5 transition-colors',
              active ? 'bg-day-active' : 'bg-[#f1f2f4]',
            )}
          >
            <span className="text-[15px] font-bold leading-none text-ink">{day.label}</span>
            <span className={cn('mt-1.5 text-[13px] leading-none', active ? 'font-medium text-ink/70' : 'text-ink-mute')}>
              {day.sublabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
