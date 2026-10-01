import logo from '@/assets/logo-lpf.webp'
import { cn } from '@/lib/cn'

export function LpfLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="LPF"
      draggable={false}
      className={cn('select-none', className)}
    />
  )
}
