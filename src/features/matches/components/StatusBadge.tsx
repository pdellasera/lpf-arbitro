import { cn } from '@/lib/cn'
import type { MatchStatus } from '../types'

interface StatusBadgeProps {
  label: string
  status: MatchStatus
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const finished = status === 'finished'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em]',
        finished ? 'bg-[#eef0f3] text-[#6b7280]' : 'bg-[#e7f8f0] text-[#05b56b]',
      )}
    >
      {label}
    </span>
  )
}
