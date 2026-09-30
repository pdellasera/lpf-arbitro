import { isBookedRed, type BookingCount } from '../lib/bookings'
import type { ActionKind } from '../data/actionConfig'
import type { LineupPlayer } from '../types'
import { PlayerVisual } from './PlayerVisual'

// Límites del césped en el lienzo de diseño (x 144..1094, y 111..671).
const PITCH_X0 = 144
const PITCH_W = 950
const PITCH_Y0 = 111
const PITCH_H = 560

interface PlayerCardProps {
  player: LineupPlayer
  teamName: string
  crest: string
  cards?: BookingCount
  onQuickAction?: (action: ActionKind) => void
}

/**
 * Ficha anclada al dorsal del jugador (imagen + nombre + posición + tarjetas).
 * Se posiciona dentro de `.pitch-box` (cqw) con "flip" para no salirse del campo.
 */
export function PlayerCard({ player, teamName, crest, cards, onQuickAction }: PlayerCardProps) {
  if (player.x == null || player.y == null) return null

  const xPct = ((player.x - PITCH_X0) / PITCH_W) * 100
  const yPct = ((player.y - PITCH_Y0) / PITCH_H) * 100

  const placeX = xPct > 78 ? 'right-0' : xPct < 22 ? 'left-0' : 'left-1/2 -translate-x-1/2'
  const placeY = yPct < 32 ? 'top-full mt-2' : 'bottom-full mb-2'

  const bookedRed = isBookedRed(cards)
  const showCards = cards && (cards.yellow > 0 || cards.red > 0)

  return (
    <div className="pointer-events-none absolute z-20" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <div
        data-player-card
        className={`pointer-events-auto absolute ${placeX} ${placeY} w-[clamp(150px,30cqw,220px)] rounded-2xl border border-white/15 bg-[#04121f]/95 p-3 shadow-2xl backdrop-blur`}
      >
        <div className="flex items-center gap-2.5">
          <PlayerVisual player={player} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                data-card-name
                className="truncate text-[clamp(12px,2.1cqw,15px)] font-bold leading-tight text-white"
              >
                {player.name}
              </span>
              <span className="shrink-0 rounded bg-white/10 px-1 py-0.5 text-[clamp(9px,1.4cqw,11px)] font-bold tabular-nums text-white/70">
                {player.number}
              </span>
            </div>
            <p data-card-position className="truncate text-[clamp(10px,1.6cqw,12px)] text-[#a3b1c1]">
              {player.position}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <img
            src={crest}
            alt=""
            className="h-[clamp(14px,2.4cqw,18px)] w-[clamp(14px,2.4cqw,18px)] shrink-0 object-contain"
          />
          <span className="min-w-0 truncate text-[clamp(10px,1.6cqw,12px)] font-semibold text-white/70">
            {teamName}
          </span>
          {showCards && (
            <span className="ml-auto flex shrink-0 items-center gap-1">
              {cards.yellow > 0 && (
                <span
                  className="h-[clamp(10px,1.7cqw,13px)] w-[clamp(7px,1.2cqw,9px)] rounded-[1px] ring-1 ring-black/60"
                  style={{ background: '#dcb90a' }}
                />
              )}
              {bookedRed && (
                <span
                  className="h-[clamp(10px,1.7cqw,13px)] w-[clamp(7px,1.2cqw,9px)] rounded-[1px] ring-1 ring-black/60"
                  style={{ background: '#e5484d' }}
                />
              )}
            </span>
          )}
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <QuickButton label="Gol" onClick={() => onQuickAction?.('goal')} />
          <QuickButton label="Tarjeta" tone="yellow" onClick={() => onQuickAction?.('card')} />
          <QuickButton label="Cambio" tone="green" onClick={() => onQuickAction?.('sub')} />
        </div>
      </div>
    </div>
  )
}

function QuickButton({
  label,
  onClick,
  tone = 'brand',
}: {
  label: string
  onClick: () => void
  tone?: 'brand' | 'yellow' | 'green'
}) {
  const bg =
    tone === 'yellow' ? 'bg-[#dcb90a]/90 text-[#1a1400]' : tone === 'green' ? 'bg-[#00c258]/90 text-[#001408]' : 'bg-[#0060fd] text-white'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[clamp(28px,5cqw,34px)] rounded-lg text-[clamp(10px,1.7cqw,12px)] font-bold transition-transform active:scale-95 ${bg}`}
    >
      {label}
    </button>
  )
}
