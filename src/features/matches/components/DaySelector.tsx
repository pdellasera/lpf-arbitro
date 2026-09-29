import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { MatchDay } from '../types'

interface DaySelectorProps {
  days: MatchDay[]
  selected: string
  onSelect: (date: string) => void
}

export function DaySelector({ days, selected, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 pb-1 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day) => {
        const active = day.date === selected
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            className={cn(
              'relative flex min-w-[62px] flex-1 snap-start flex-col items-center rounded-2xl border px-3 py-2.5 transition-colors',
              active ? 'border-transparent' : 'border-[#e6e9ef] bg-white',
            )}
          >
            {active && (
              <motion.span
                layoutId="day-pill"
                className="absolute inset-0 rounded-2xl bg-brand"
                transition={{ type: 'spring', stiffness: 500, damping: 42 }}
              />
            )}
            <span className={cn('relative z-10 text-[13px] font-semibold leading-none', active ? 'text-white' : 'text-ink')}>
              {day.label}
            </span>
            <span className={cn('relative z-10 mt-1.5 text-[11px] leading-none', active ? 'text-white/80' : 'text-ink-mute')}>
              {day.sublabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
