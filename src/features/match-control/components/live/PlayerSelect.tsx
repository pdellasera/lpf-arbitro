import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LineupPlayer } from '../../types'

interface PlayerSelectProps {
  players: LineupPlayer[]
  value: string | null
  onSelect: (id: string) => void
  placeholder?: string
  /** Icono lateral estilo mockup: 'out' = sale (rojo ↓), 'in' = ingresa (verde ↑). */
  icon?: 'out' | 'in'
}

/** Selector de jugador estilo mockup: caja blanca con borde, icono lateral y chevron. */
export function PlayerSelect({ players, value, onSelect, placeholder = 'Seleccionar jugador', icon }: PlayerSelectProps) {
  const home = players.filter((p) => p.side === 'home')
  const away = players.filter((p) => p.side === 'away')
  const twoSides = home.length > 0 && away.length > 0

  return (
    <div className="relative">
      {icon && (
        <span
          data-player-icon={icon}
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full',
            icon === 'out' ? 'bg-pick' : 'bg-sub',
          )}
        >
          {icon === 'out' ? (
            <ArrowDown className="h-5 w-5 text-white" strokeWidth={3} />
          ) : (
            <ArrowUp className="h-5 w-5 text-white" strokeWidth={3} />
          )}
        </span>
      )}
      <select
        data-player-select
        value={value ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className={cn(
          'h-[52px] w-full appearance-none rounded-xl border border-line bg-white px-4 pr-11 text-[15px] font-semibold text-ink shadow-[0_2px_6px_rgba(15,23,42,0.08)] outline-none focus:border-brand focus:shadow-[0_2px_8px_rgba(0,98,253,0.15)]',
          icon && 'pl-14',
          value == null && 'text-ink-mute',
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {twoSides ? (
          <>
            <optgroup label="Local">
              {home.map((p) => (
                <option key={p.id} value={p.id}>
                  {`${p.number} - ${p.name}`}
                </option>
              ))}
            </optgroup>
            <optgroup label="Visitante">
              {away.map((p) => (
                <option key={p.id} value={p.id}>
                  {`${p.number} - ${p.name}`}
                </option>
              ))}
            </optgroup>
          </>
        ) : (
          players.map((p) => (
            <option key={p.id} value={p.id}>
              {`${p.number} - ${p.name}`}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" />
    </div>
  )
}
