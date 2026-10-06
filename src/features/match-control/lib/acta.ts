import type { LineupPlayer, MatchPeriod, Side, TimelineEvent } from '../types'

/** Marcador al descanso: goles registrados hasta el minuto 45. */
export function halfTimeScore(events: TimelineEvent[]): { home: number; away: number } {
  const result = { home: 0, away: 0 }
  for (const e of events) {
    if (e.kind !== 'goal' || e.minute > 45) continue
    if (e.side === 'home') result.home += 1
    else if (e.side === 'away') result.away += 1
  }
  return result
}

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "2025-09-28" → "28 sep 2025" (formato corto para el documento). */
export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** "19:00" + segundos jugados + descanso (15') → "20:52". */
export function matchEndTime(startTime: string, seconds: number, hasSecondHalf: boolean): string {
  const [h = 0, m = 0] = startTime.split(':').map((n) => Number(n))
  const breakMinutes = hasSecondHalf ? 15 : 0
  const total = h * 60 + m + Math.round(seconds / 60) + breakMinutes
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/** Duración del partido a partir de los periodos: "90' + 7' (97')". */
export function formatDuration(periods: MatchPeriod[]): string {
  const added = Math.round(periods.reduce((acc, p) => acc + p.addedSeconds, 0) / 60)
  const total = 90 + added
  return `90' + ${added}' (${total}')`
}

export interface GoalRecord {
  number: number
  name: string
  minute: number
  penalty: boolean
}

/** Goles de un bando (ordenados por minuto) con dorsal resuelto desde la alineación. */
export function goalsBySide(events: TimelineEvent[], players: LineupPlayer[], side: Side): GoalRecord[] {
  return events
    .filter((e) => e.kind === 'goal' && e.side === side)
    .map((e) => {
      const shirt = players.find((p) => p.id === e.playerId)?.number ?? 0
      return {
        number: shirt,
        name: e.player ?? '—',
        minute: e.minute,
        penalty: /penal/i.test(e.label ?? ''),
      }
    })
    .sort((a, b) => a.minute - b.minute)
}
