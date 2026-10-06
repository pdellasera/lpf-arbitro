import { DEFAULT_REFEREES, MATCHES_BY_DAY, MATCH_DAYS, MATCH_DETAILS } from '../data/mockMatches'
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
  const list = MATCHES_BY_DAY[date] ?? []
  return list.map((match) => ({
    ...match,
    date,
    city: MATCH_DETAILS[match.id]?.city ?? match.home.country,
    referees: DEFAULT_REFEREES,
  }))
}
