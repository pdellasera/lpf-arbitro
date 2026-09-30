import type { TimelineEvent } from '../types'

export interface BookingCount {
  yellow: number
  red: number
}

/**
 * Agrega las amonestaciones por jugador a partir de los eventos del partido.
 * Cada `yellow` suma amarilla y cada `red` marca expulsión directa.
 */
export function getBookings(events: TimelineEvent[]): Map<string, BookingCount> {
  const map = new Map<string, BookingCount>()
  for (const ev of events) {
    if (!ev.playerId) continue
    const cur = map.get(ev.playerId) ?? { yellow: 0, red: 0 }
    if (ev.kind === 'yellow') cur.yellow += 1
    else if (ev.kind === 'red') cur.red += 1
    map.set(ev.playerId, cur)
  }
  return map
}

/** Segunda amarilla o roja directa ⇒ se muestra como expulsión (badge rojo). */
export function isBookedRed(c: BookingCount | undefined): boolean {
  return !!c && (c.red >= 1 || c.yellow >= 2)
}
