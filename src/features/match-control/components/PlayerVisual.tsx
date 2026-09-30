import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { cn } from '@/lib/cn'
import { markerColor } from '../lib/markerColor'
import type { LineupPlayer } from '../types'

interface PlayerVisualProps {
  player: LineupPlayer
  size: number
  className?: string
}

/**
 * Retrato del jugador: usa la foto si existe; si no, una "camiseta" CSS con el
 * dorsal y el color del equipo (mismo color que el marcador de la cancha).
 */
export function PlayerVisual({ player, size, className }: PlayerVisualProps) {
  if (player.avatar) {
    return <PlayerAvatar src={player.avatar} name={player.name} size={size} className={className} />
  }

  return (
    <span
      aria-hidden="true"
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-white/25', className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(160deg, ${markerColor(player)} 0%, ${markerColor(player)} 100%)`,
      }}
    >
      {/* brillo superior para que se lea como una camiseta/balón */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 55%)',
        }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center font-bold tabular-nums text-white"
        style={{ fontSize: Math.round(size * 0.44), textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}
      >
        {player.number}
      </span>
    </span>
  )
}
