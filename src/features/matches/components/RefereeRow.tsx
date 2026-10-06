import type { LucideIcon } from 'lucide-react'

interface RefereeRowProps {
  icon: LucideIcon
  role: string
  name: string
}

export function RefereeRow({ icon: Icon, role, name }: RefereeRowProps) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="h-6 w-6 shrink-0 text-ink-soft" />
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-tight text-ink-soft">{role}</p>
        <p className="mt-1 text-[17px] font-bold leading-tight text-ink">{name}</p>
      </div>
    </div>
  )
}
