import type { LineupPlayer } from '../types'

/** Color del dorsal/marcador según lado y rol (mismo código que usa la cancha). */
export function markerColor(player: LineupPlayer): string {
  if (player.kind === 'gk') return player.side === 'home' ? '#05b550' : '#e8c50a'
  if (player.kind === 'focus') return '#c80313'
  if (player.side === 'away') return '#c80313'
  return '#0d2031'
}
