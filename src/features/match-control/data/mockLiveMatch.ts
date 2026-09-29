import p1 from '@/assets/players/p1.webp'
import p2 from '@/assets/players/p2.webp'
import p3 from '@/assets/players/p3.webp'
import p4 from '@/assets/players/p4.webp'
import type { Match } from '@/features/matches/types'
import type { LineupPlayer, LiveMatch } from '../types'

function p(
  id: string,
  number: number,
  name: string,
  position: string,
  side: 'home' | 'away',
  starter: boolean,
  x?: number,
  y?: number,
  extra?: Partial<LineupPlayer>,
): LineupPlayer {
  return { id, number, name, position, side, starter, x, y, ...extra }
}

const HOME: LineupPlayer[] = [
  p('h1', 1, 'R. Pérez', 'Portero', 'home', true, 211, 368, { kind: 'gk' }),
  p('h2', 2, 'J. Ramírez', 'Defensa', 'home', true, 331, 529),
  p('h3', 3, 'L. Díaz', 'Defensa', 'home', true, 332, 210),
  p('h4', 4, 'C. Sánchez', 'Defensa', 'home', true, 306, 431),
  p('h5', 5, 'A. Castillo', 'Defensa', 'home', true, 415, 397),
  p('h6', 6, 'M. Torres', 'Mediocampista', 'home', true, 299, 312),
  p('h7', 7, 'D. Torres', 'Delantero', 'home', true, 505, 492, { avatar: p3 }),
  p('h8', 8, 'F. Gómez', 'Mediocampista', 'home', true, 414, 284),
  p('h9', 9, 'L. Rodríguez', 'Delantero', 'home', true, 615, 320, { avatar: p4 }),
  p('h10', 10, 'J. Martínez', 'Mediocampista', 'home', true, 520, 345, { avatar: p2 }),
  p('h11', 11, 'R. Cedeño', 'Delantero', 'home', true, 510, 216, { avatar: p1, hasBall: true }),
  p('h12', 12, 'K. Arosemena', 'Portero', 'home', false),
  p('h13', 13, 'J. Cedeño', 'Defensa', 'home', false),
  p('h14', 14, 'A. Carrasquilla', 'Mediocampista', 'home', false),
  p('h15', 15, 'M. Murillo', 'Delantero', 'home', false),
]

const AWAY: LineupPlayer[] = [
  p('a1', 1, 'C. Méndez', 'Portero', 'away', true, 1027, 369, { kind: 'gk' }),
  p('a2', 2, 'D. Vargas', 'Defensa', 'away', true, 917, 216),
  p('a3', 3, 'E. Díaz', 'Defensa', 'away', true, 918, 530),
  p('a4', 4, 'J. Pérez', 'Defensa', 'away', true, 944, 312),
  p('a5', 5, 'T. Moreno', 'Defensa', 'away', true, 929, 431),
  p('a6', 6, 'R. Castillo', 'Defensa', 'away', true, 761, 531),
  p('a7', 7, 'S. López', 'Mediocampista', 'away', true, 738, 291),
  p('a8', 8, 'L. Gómez', 'Mediocampista', 'away', true, 761, 434),
  p('a9', 9, 'K. Ortega', 'Delantero', 'away', true, 688, 369, { kind: 'focus' }),
  p('a10', 10, 'A. Núñez', 'Mediocampista', 'away', true, 830, 342),
  p('a11', 11, 'M. Rojas', 'Delantero', 'away', true, 772, 203),
  p('a12', 12, 'J. Blackburn', 'Portero', 'away', false),
  p('a13', 13, 'E. Small', 'Defensa', 'away', false),
  p('a14', 14, 'C. Yanis', 'Mediocampista', 'away', false),
  p('a15', 15, 'R. Phillips', 'Delantero', 'away', false),
]

export const MOCK_LINEUP: LineupPlayer[] = [...HOME, ...AWAY]

/**
 * Construye un partido "por iniciar": 0-0, reloj en 0, sin periodos ni eventos.
 * Los jugadores usan la alineación de demostración; los equipos vienen de la tarjeta.
 */
export function createLiveMatch(match: Match): LiveMatch {
  return {
    id: `live-${match.id}`,
    home: match.home,
    away: match.away,
    score: { home: 0, away: 0 },
    phase: 'pre',
    clockSeconds: 0,
    players: MOCK_LINEUP,
    events: [],
    periods: [],
  }
}
