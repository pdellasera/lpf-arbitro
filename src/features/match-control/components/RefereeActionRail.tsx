import type { ReactNode } from 'react'
import { Crosshair, Ellipsis, Flag, Hand, Play, Repeat2, Volleyball } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ACTIONS, RAIL_ORDER, type ActionKind } from '../data/actionConfig'

function RailGlyph({ id, active }: { id: ActionKind; active: boolean }) {
  switch (id) {
    case 'goal':
      return <Volleyball className="h-5 w-5 text-white short:h-4 short:w-4" />
    case 'card':
      return <span className={cn('h-[18px] w-[14px] rounded-[3px] short:h-[14px] short:w-[11px]', active ? 'bg-white' : 'bg-[#dcb90a]')} />
    case 'sub':
      return <Repeat2 className={cn('h-5 w-5 short:h-4 short:w-4', active ? 'text-white' : 'text-[#00c258]')} />
    case 'incident':
      return (
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md short:h-5 short:w-5', active ? 'bg-white' : 'bg-[#6c1be7]')}>
          <Play className={cn('h-3 w-3 short:h-2.5 short:w-2.5', active ? 'text-[#6c1be7]' : 'text-white')} />
        </span>
      )
    case 'foul':
      return <Crosshair className="h-5 w-5 text-white short:h-4 short:w-4" />
    case 'freekick':
      return <Hand className="h-5 w-5 text-white short:h-4 short:w-4" />
    case 'corner':
      return <Flag className="h-5 w-5 text-white short:h-4 short:w-4" />
    default:
      return <Ellipsis className="h-5 w-5 text-white short:h-4 short:w-4" />
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
      data-rail
      className="absolute z-20 flex w-[clamp(84px,9vw,132px)] flex-col overflow-hidden rounded-2xl bg-[#0f2135]/70 shadow-lg ring-1 ring-white/10 backdrop-blur short:w-[clamp(96px,15vw,140px)]"
      style={{
        left: 'max(var(--live-gap), env(safe-area-inset-left))',
        top: 'calc(var(--live-header-h) + max(var(--live-gap), env(safe-area-inset-top)) + var(--live-gap))',
        bottom: 'calc(var(--live-timeline-h) + max(var(--live-gap), env(safe-area-inset-bottom)) + var(--live-gap))',
      }}
    >
      {header && <div className="shrink-0 p-1.5 pb-0">{header}</div>}

      {/* Grid sin scroll: 1 columna en pantallas altas, 2 columnas en pantallas bajas.
          gridAutoRows:1fr reparte el alto sobrante por igual para que quepan las 8. */}
      <div className="grid flex-1 grid-cols-1 gap-1.5 p-1.5 short:grid-cols-2 short:gap-1 short:p-1" style={{ gridAutoRows: '1fr' }}>
        {RAIL_ORDER.map((id) => {
          const isActive = id === active
          return (
            <button
              key={id}
              type="button"
              data-action={id}
              onClick={() => onSelect(id)}
              title={ACTIONS[id].label}
              aria-label={ACTIONS[id].label}
              className={cn(
                'flex min-h-[40px] items-center gap-2 rounded-xl px-2 text-left transition-colors short:min-h-[30px] short:flex-col short:items-center short:justify-center short:gap-1 short:px-1',
                isActive ? 'bg-[#0060fd]' : 'bg-[#0f2135]/75 hover:bg-[#0f2135]',
              )}
            >
              <RailGlyph id={id} active={isActive} />
              <span
                className={cn(
                  'text-[11px] font-semibold leading-tight short:text-center short:text-[9px] short:leading-[1.1]',
                  isActive ? 'text-white' : 'text-white/95',
                )}
              >
                {ACTIONS[id].label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
