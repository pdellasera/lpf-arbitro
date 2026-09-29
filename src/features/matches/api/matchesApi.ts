import { MATCHES_BY_DAY, MATCH_DAYS } from '../data/mockMatches'
import type { Match, MatchDay } from '../types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Devuelve los días del selector (mock local; sustituible por backend). */
export async function fetchMatchDays(): Promise<MatchDay[]> {
  await delay(150)
  return MATCH_DAYS
}

/** Devuelve los partidos de un día concreto. */
export async function fetchMatchesByDay(date: string): Promise<Match[]> {
  await delay(250)
  return MATCHES_BY_DAY[date] ?? []
}
