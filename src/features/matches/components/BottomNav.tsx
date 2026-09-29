import { CalendarDays, ChartColumn, FileText, House, UserRound, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  active?: boolean
}

const ITEMS: NavItem[] = [
  { id: 'matches', label: 'Mis partidos', icon: House, active: true },
  { id: 'reports', label: 'Informes', icon: FileText },
  { id: 'stats', label: 'Estadísticas', icon: ChartColumn },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'profile', label: 'Perfil', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-[#eceef2] bg-white pb-[max(0.4rem,env(safe-area-inset-bottom))]">
      <div className="flex">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.id} type="button" className="flex flex-1 flex-col items-center gap-1 pt-2.5">
              <Icon
                className={cn('h-[22px] w-[22px]', item.active ? 'text-[#0062fd]' : 'text-ink-mute')}
                fill={item.active ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
              <span className={cn('text-[10px] font-medium leading-none', item.active ? 'text-[#0062fd]' : 'text-ink-mute')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
