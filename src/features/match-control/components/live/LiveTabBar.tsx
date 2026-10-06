import { cn } from '@/lib/cn'
import type { LiveTab, LiveTabId } from '../../data/liveGrid'

interface LiveTabBarProps {
  tabs: LiveTab[]
  active: LiveTabId
  onChange: (id: LiveTabId) => void
}

export function LiveTabBar({ tabs, active, onChange }: LiveTabBarProps) {
  return (
    <nav className="flex gap-1 border-b border-line bg-page px-3 pt-2">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            data-tab={tab.id}
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-1 rounded-t-xl px-1 pb-2.5 pt-2',
              isActive ? 'bg-white' : 'bg-transparent',
            )}
          >
            <Icon className={cn('h-6 w-6', isActive ? 'text-brand' : 'text-ink-mute')} strokeWidth={2} />
            <span className={cn('text-[12px] font-semibold leading-none', isActive ? 'text-brand' : 'text-ink-mute')}>
              {tab.label}
            </span>
            {isActive && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-[2px] bg-brand" />}
          </button>
        )
      })}
    </nav>
  )
}
