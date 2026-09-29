import type { Team } from '@/features/matches/types'

export type Side = 'home' | 'away'

export type MarkerKind = 'field' | 'gk' | 'focus'

export interface LineupPlayer {
  id: string
  number: number
  name: string
  position: string
  side: Side
  starter: boolean
  /** Posición del marcador en el lienzo (px de diseño). Solo titulares. */
  x?: number
  y?: number
  avatar?: string
  hasBall?: boolean
  kind?: MarkerKind
}

export type EventKind =
  | 'goal'
  | 'yellow'
  | 'red'
  | 'sub'
  | 'incident'
  | 'foul'
  | 'freekick'
  | 'corner'
  | 'penalty'
  | 'goal-disallowed'
  | 'var'
  | 'added-time'
  | 'saque'
  | 'half-end'

export interface TimelineEvent {
  id: string
  minute: number
  kind: EventKind
  side: Side | 'neutral'
  player?: string
  label?: string
}

export type MatchPhase = 'pre' | 'first' | 'break' | 'second' | 'ended'

export interface MatchPeriod {
  id: string
  half: 1 | 2
  label: '1T' | '2T'
  startSeconds: number
  endSeconds: number
  addedSeconds: number
}

export interface LiveMatch {
  id: string
  home: Team
  away: Team
  score: { home: number; away: number }
  phase: MatchPhase
  clockSeconds: number
  players: LineupPlayer[]
  events: TimelineEvent[]
  periods: MatchPeriod[]
}

/** Borrador que produce el panel de evento al confirmar. */
export interface EventDraft {
  kind: EventKind
  side: Side | 'neutral'
  playerId?: string
  player?: string
  secondaryPlayerId?: string
  minute: number
  option?: string
  note?: string
  addedMinutes?: number
}
