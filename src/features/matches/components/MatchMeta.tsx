import { Castle, CircleCheck, FileText, Whistle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MatchMetaItem, MetaIcon } from '../types'

const ICONS: Record<MetaIcon, LucideIcon> = {
  castle: Castle,
  whistle: Whistle,
  file: FileText,
  check: CircleCheck,
}

interface MatchMetaProps {
  items: MatchMetaItem[]
}

export function MatchMeta({ items }: MatchMetaProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {items.map((item, i) => {
        const Icon = ICONS[item.icon]
        const green = item.tone === 'green'
        return (
          <div key={i} className="flex min-w-0 items-center gap-1.5">
            <Icon className={cn('h-4 w-4 shrink-0', green ? 'text-[#05b56b]' : 'text-ink')} />
            <span className={cn('truncate text-[11px] leading-tight', green ? 'font-medium text-[#05b56b]' : 'text-ink-soft')}>
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
