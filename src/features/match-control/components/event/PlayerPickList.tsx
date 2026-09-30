import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { isBookedRed, type BookingCount } from '../../lib/bookings'
import { markerColor } from '../../lib/markerColor'
import type { LineupPlayer } from '../../types'

interface PlayerPickListProps {
  players: LineupPlayer[]
  value: string | null
  onSelect: (id: string) => void
  placeholder?: string
  bookings?: Map<string, BookingCount>
}

export function PlayerPickList({
  players,
  value,
  onSelect,
  placeholder = 'Buscar jugador...',
  bookings,
}: PlayerPickListProps) {
  const [q, setQ] = useState('')
  const showSearch = players.length > 12
  const filtered = players.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      {showSearch && (
        <div className="mb-2 flex h-10 items-center gap-2.5 rounded-xl bg-[#0d1f32] px-3.5">
          <Search className="h-[18px] w-[18px] shrink-0 text-[#8ca0b5]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5 short:grid-cols-4 short:gap-1.5">
        {filtered.map((p) => {
          const active = p.id === value
          const booked = bookings?.get(p.id)
          const bookedRed = isBookedRed(booked)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              aria-label={p.name}
              aria-pressed={active}
              data-drawer-cell
              data-player-id={p.id}
              className={cn(
                'flex h-[var(--live-cell-h)] flex-col items-center justify-center gap-1 rounded-xl px-1 text-center transition-colors',
                active ? 'bg-[#12263b] ring-1 ring-[#0062fd]' : 'hover:bg-white/5',
              )}
            >
              <span
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-white/25 short:h-7 short:w-7 short:text-[13px]"
                style={{ background: markerColor(p) }}
              >
                {p.number}
                {booked && (booked.yellow > 0 || booked.red > 0) && (
                  <span
                    data-booking={bookedRed ? 'red' : 'yellow'}
                    className="absolute -right-1 -top-0.5 h-2.5 w-1.5 rounded-[1px] ring-1 ring-black/60"
                    style={{ background: bookedRed ? '#e5484d' : '#dcb90a' }}
                  />
                )}
              </span>
              <span className="w-full truncate text-[12px] font-semibold leading-tight text-white short:text-[11px]">
                {p.name}
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-full px-2.5 py-2 text-[13px] text-[#8d9aa5]">Sin resultados</p>
        )}
      </div>
    </div>
  )
}

