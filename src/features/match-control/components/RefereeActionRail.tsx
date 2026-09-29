import type { ReactNode } from 'react'
import { Crosshair, Ellipsis, Flag, Hand, Play, Repeat2, Volleyball } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ACTIONS, RAIL_ORDER, type ActionKind } from '../data/actionConfig'

function RailGlyph({ id, active }: { id: ActionKind; active: boolean }) {
  switch (id) {
    case 'goal':
      return <Volleyball className="h-5 w-5 text-white" />
    case 'card':
      return <span className={cn('h-[18px] w-[14px] rounded-[3px]', active ? 'bg-white' : 'bg-[#dcb90a]')} />
    case 'sub':
      return <Repeat2 className={cn('h-5 w-5', active ? 'text-white' : 'text-[#00c258]')} />
    case 'incident':
      return (
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', active ? 'bg-white' : 'bg-[#6c1be7]')}>
          <Play className={cn('h-3 w-3', active ? 'text-[#6c1be7]' : 'text-white')} />
        </span>
      )
    case 'foul':
      return <Crosshair className="h-5 w-5 text-white" />
    case 'freekick':
      return <Hand className="h-5 w-5 text-white" />
    case 'corner':
      return <Flag className="h-5 w-5 text-white" />
    default:
      return <Ellipsis className="h-5 w-5 text-white" />
  }
}

interface RefereeActionRailProps {
  active: ActionKind
  onSelect: (id: ActionKind) => void
  header?: ReactNode
}

export function RefereeActionRail({ active, onSelect, header }: RefereeActionRailProps) {
  return (
    <div
      className="flex shrink-0 flex-col rounded-xl bg-[#0f2135]/50"
      style={{ width: 'clamp(72px, 9.5vw, 150px)' }}
    >
      {header && <div className="shrink-0 p-1.5 pb-0">{header}</div>}

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-1.5">
        {RAIL_ORDER.map((id) => {
          const isActive = id === active
          const label = id === 'corner' ? 'Tiro de\nesquina' : ACTIONS[id].label
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-2 text-left transition-colors',
                isActive ? 'bg-[#0060fd]' : 'bg-[#0f2135]/75 hover:bg-[#0f2135]',
              )}
              style={{ height: 'clamp(48px, 8.4dvh, 68px)' }}
            >
              <RailGlyph id={id} active={isActive} />
              <span className={cn('text-[11px] font-semibold leading-tight', isActive ? 'text-white' : 'text-white/95')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
