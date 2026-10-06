import { Bell, CalendarDays, House, UserRound, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  active?: boolean
  badge?: boolean
  onClick?: () => void
}

interface BottomNavProps {
  onProfile?: () => void
}

export function BottomNav({ onProfile }: BottomNavProps) {
  const items: NavItem[] = [
    { id: 'home', label: 'Inicio', icon: House, active: true },
    { id: 'matches', label: 'Mis partidos', icon: CalendarDays },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: true },
    { id: 'profile', label: 'Perfil', icon: UserRound, onClick: onProfile },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-line bg-white pb-[max(0.4rem,env(safe-area-inset-bottom))]">
      <div className="flex">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="flex flex-1 flex-col items-center gap-1 pt-2.5"
            >
              <span className="relative">
                <Icon
                  className={cn('h-[22px] w-[22px]', item.active ? 'text-brand' : 'text-ink-mute')}
                  fill={item.active ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
                {item.badge && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
                )}
              </span>
              <span className={cn('text-[10px] font-medium leading-none', item.active ? 'text-brand' : 'text-ink-mute')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
