export type MatchStatus = 'upcoming' | 'live' | 'finished'

export interface Team {
  name: string
  country: string
  crest: string
}

export interface RefereeAssignment {
  role: string
  name: string
}

export interface Match {
  id: string
  status: MatchStatus
  badge: string
  league: string
  jornada: number
  venue: string
  featured?: boolean
  date?: string
  city?: string
  referees?: RefereeAssignment[]
  home: Team
  away: Team
  score: { home: number; away: number } | null
  trailing: string
}

export interface MatchDay {
  date: string
  label: string
  sublabel: string
}
