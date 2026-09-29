import { Minus, Plus } from 'lucide-react'

interface MinuteStepperProps {
  value: number
  onChange: (n: number) => void
  label?: string
}

export function MinuteStepper({ value, onChange, label = 'Minuto' }: MinuteStepperProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-white">{label}</span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Restar minuto"
          className="flex h-10 w-12 items-center justify-center rounded-lg bg-[#1a2e44] text-white hover:bg-[#22384f]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[34px] text-center text-base font-bold tabular-nums text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label="Sumar minuto"
          className="flex h-10 w-12 items-center justify-center rounded-lg bg-[#1a2e44] text-white hover:bg-[#22384f]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
