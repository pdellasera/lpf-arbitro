import { Clock } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatusBadgeProps {
  label: string
  green?: boolean
}

export function StatusBadge({ label, green = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold',
        green ? 'bg-accent-green-soft text-accent-green' : 'bg-badge-gray text-badge-gray-ink',
      )}
    >
      {green && <Clock className="h-3.5 w-3.5" />}
      {label}
    </span>
  )
}
