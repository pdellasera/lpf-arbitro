import shield from '@/assets/shield.webp'
import { cn } from '@/lib/cn'

export function LpfLogo({ className }: { className?: string }) {
  return (
    <img
      src={shield}
      alt="LPF"
      draggable={false}
      className={cn('select-none', className)}
    />
  )
}
