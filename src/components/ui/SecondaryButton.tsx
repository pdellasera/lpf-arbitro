import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SecondaryButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon?: ReactNode
  children?: ReactNode
}

export function SecondaryButton({ icon, children, className, ...rest }: SecondaryButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 py-3 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-white/10',
        className,
      )}
      {...rest}
    >
      <span className="inline-flex">{icon ?? <ShieldCheck className="h-5 w-5 text-[#3c84e8]" />}</span>
      {children}
    </motion.button>
  )
}
