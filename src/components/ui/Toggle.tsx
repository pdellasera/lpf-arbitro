import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5"
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-[#0062fd]' : 'bg-white/20',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm',
            checked ? 'ml-[18px]' : 'ml-0.5',
          )}
        />
      </span>
      {label && <span className="text-[13px] text-white/80">{label}</span>}
    </button>
  )
}
