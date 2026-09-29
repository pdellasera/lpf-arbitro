import { type InputHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  trailing?: ReactNode
  error?: string
}

export function TextField({ label, icon, trailing, error, className, ...rest }: TextFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <motion.div
        animate={error ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'flex items-center gap-3 rounded-xl border bg-[#122238] px-4 py-2.5 transition-colors duration-200',
          error
            ? 'border-red-400/60'
            : 'border-white/10 focus-within:border-[#0062fd] focus-within:ring-2 focus-within:ring-[#0062fd]/25',
        )}
      >
        {icon && <span className="shrink-0 text-[#8ca0b5]">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium leading-none text-[#8ca0b5]">{label}</span>
          <input
            className="mt-1.5 w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/25"
            {...rest}
          />
        </span>
        {trailing && <span className="shrink-0">{trailing}</span>}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="overflow-hidden text-xs text-red-300"
          >
            <span className="block pl-1 pt-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
