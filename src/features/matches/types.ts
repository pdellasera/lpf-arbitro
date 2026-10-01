export type MatchStatus = 'upcoming' | 'live' | 'finished'

export interface Team {
  name: string
  country: string
  crest: string
}

export type MetaIcon = 'castle' | 'whistle' | 'file' | 'check'

export interface MatchMetaItem {
  icon: MetaIcon
  label: string
  tone?: 'default' | 'green'
}

export interface Match {
  id: string
  status: MatchStatus
  badge: string
  league: string
  jornada: number
  home: Team
  away: Team
  score: { home: number; away: number } | null
  trailing: string
  meta: MatchMetaItem[]
}

export interface MatchDay {
  date: string
  label: string
  sublabel: string
}

export interface MatchSchedule {
  day: MatchDay
  matches: Match[]
}
