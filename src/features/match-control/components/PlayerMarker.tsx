import { Volleyball } from 'lucide-react'
import type { LineupPlayer } from '../types'

// Límites del césped en el lienzo de diseño (x 144..1094, y 111..671).
const PITCH_X0 = 144
const PITCH_W = 950
const PITCH_Y0 = 111
const PITCH_H = 560

interface PlayerMarkerProps {
  player: LineupPlayer
  selected?: boolean
  onSelect?: (id: string) => void
}

export function PlayerMarker({ player, selected, onSelect }: PlayerMarkerProps) {
  if (!player.starter || player.x == null || player.y == null) return null

  const xPct = ((player.x - PITCH_X0) / PITCH_W) * 100
  const yPct = ((player.y - PITCH_Y0) / PITCH_H) * 100

  let bg = '#0d2031'
  if (player.kind === 'gk') bg = player.side === 'home' ? '#05b550' : '#e8c50a'
  if (player.kind === 'focus') bg = '#c80313'
  if (player.kind !== 'gk' && player.kind !== 'focus' && player.side === 'away') bg = '#c80313'

  return (
    <button
      type="button"
      onClick={() => onSelect?.(player.id)}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center outline-none"
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ring-1 ring-white/25"
        style={{
          background: selected ? '#ffffff' : bg,
          color: selected ? '#0d2031' : '#ffffff',
          boxShadow: selected ? '0 0 0 3px #0062fd' : undefined,
        }}
      >
        {player.number}
      </span>
      <span className="mt-0.5 flex items-center gap-1 whitespace-nowrap rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
        {player.name}
        {player.hasBall && <Volleyball className="h-3 w-3 text-white" />}
      </span>
    </button>
  )
}
