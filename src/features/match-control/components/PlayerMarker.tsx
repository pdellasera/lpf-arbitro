import { Volleyball } from 'lucide-react'
import { isBookedRed, type BookingCount } from '../lib/bookings'
import { markerColor } from '../lib/markerColor'
import type { LineupPlayer } from '../types'

// Límites del césped en el lienzo de diseño (x 144..1094, y 111..671).
const PITCH_X0 = 144
const PITCH_W = 950
const PITCH_Y0 = 111
const PITCH_H = 560

interface PlayerMarkerProps {
  player: LineupPlayer
  selected?: boolean
  /** Indica que la ficha del jugador está abierta (para `aria-expanded`). */
  expanded?: boolean
  /** Amonestaciones del jugador (badge amarillo/rojo sobre el dorsal). */
  cards?: BookingCount
  onSelect?: (id: string) => void
}

export function PlayerMarker({ player, selected, expanded, cards, onSelect }: PlayerMarkerProps) {
  if (!player.starter || player.x == null || player.y == null) return null

  const xPct = ((player.x - PITCH_X0) / PITCH_W) * 100
  const yPct = ((player.y - PITCH_Y0) / PITCH_H) * 100
  const bg = markerColor(player)
  const booked = cards && (cards.yellow > 0 || cards.red > 0)
  const bookedRed = isBookedRed(cards)

  return (
    <button
      type="button"
      onClick={() => onSelect?.(player.id)}
      aria-label={`${player.name} · ${player.number}`}
      aria-expanded={expanded ? true : undefined}
      className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        width: 'clamp(20px, 2.9cqw, 28px)',
        height: 'clamp(20px, 2.9cqw, 28px)',
      }}
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-full font-bold ring-1 ring-white/25"
        style={{
          fontSize: 'clamp(11px, 1.45cqw, 13px)',
          background: selected ? '#ffffff' : bg,
          color: selected ? '#0d2031' : '#ffffff',
          boxShadow: selected ? '0 0 0 3px #0062fd' : bookedRed ? '0 0 0 2px #e5484d55' : undefined,
        }}
      >
        {player.number}
      </span>

      {booked && (
        <span
          data-booking={bookedRed ? 'red' : 'yellow'}
          className="absolute -right-0.5 -top-0.5 rounded-[1px] ring-1 ring-black/60"
          style={{
            width: 'clamp(8px, 1.15cqw, 12px)',
            height: 'clamp(11px, 1.6cqw, 16px)',
            background: bookedRed ? '#e5484d' : '#dcb90a',
          }}
        />
      )}

      <span
        data-selected={selected ? 'true' : 'false'}
        className="player-label absolute left-1/2 top-full mt-0.5 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md bg-black/55 px-1.5 py-0.5 font-semibold leading-none text-white"
        style={{ fontSize: 'clamp(9px, 1.15cqw, 11px)' }}
      >
        {player.name}
        {player.hasBall && <Volleyball className="h-3 w-3 text-white" />}
      </span>
    </button>
  )
}

