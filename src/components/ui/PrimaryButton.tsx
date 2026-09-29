import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface PrimaryButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

export function PrimaryButton({
  loading,
  icon,
  children,
  className,
  disabled,
  ...rest
}: PrimaryButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      disabled={disabled || loading}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-xl bg-[#0062fd] py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-[#0062fd]/30 transition-colors duration-200 hover:bg-[#1a74ff] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <span>{children}</span>
          <span className="inline-flex">{icon ?? <ArrowRight className="h-5 w-5" />}</span>
        </>
      )}
    </motion.button>
  )
}
