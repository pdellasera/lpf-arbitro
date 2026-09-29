import { useEffect, useState } from 'react'
import type { EventDraft, LiveMatch, MatchPeriod, TimelineEvent } from '../types'

let seq = 0
const nextId = () => `ev-${++seq}-${Date.now()}`

export function useLiveMatchState(initial: LiveMatch) {
  const [match, setMatch] = useState<LiveMatch>(initial)
  const [seconds, setSeconds] = useState(initial.clockSeconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const recordEvent = (draft: EventDraft) => {
    setMatch((m) => {
      const event: TimelineEvent = {
        id: nextId(),
        minute: draft.minute,
        kind: draft.kind,
        side: draft.side,
        player: draft.player,
        label: draft.option ?? draft.note,
      }
      const score =
        draft.kind === 'goal' && (draft.side === 'home' || draft.side === 'away')
          ? { ...m.score, [draft.side]: m.score[draft.side] + 1 }
          : m.score
      return { ...m, score, events: [...m.events, event] }
    })
  }

  /** Pitido inicial: arranca el reloj en 0 y abre la 1ª parte. */
  const startMatch = () => {
    setSeconds(0)
    setRunning(true)
    setMatch((m) => {
      if (m.phase !== 'pre') return m
      const period: MatchPeriod = { id: nextId(), half: 1, label: '1T', startSeconds: 0, endSeconds: 0, addedSeconds: 0 }
      return { ...m, phase: 'first', periods: [period] }
    })
  }

  /** Inicio de la 2ª parte: el reloj continúa donde cerró la 1ª parte. */
  const startSecondHalf = () => {
    setRunning(true)
    setMatch((m) => {
      if (m.phase !== 'break') return m
      const first = m.periods.find((p) => p.half === 1)
      const startSeconds = first?.endSeconds ?? seconds
      const period: MatchPeriod = { id: nextId(), half: 2, label: '2T', startSeconds, endSeconds: 0, addedSeconds: 0 }
      return { ...m, phase: 'second', periods: [...m.periods, period] }
    })
  }

  /** Cierra la parte abierta con su tiempo añadido; pasa a entretiempo o finaliza. */
  const endHalf = (addedMinutes: number) => {
    setRunning(false)
    const endSeconds = seconds
    setMatch((m) => {
      const open = m.periods.find((p) => p.endSeconds === 0)
      if (!open) return m
      const periods = m.periods.map((p) =>
        p.id === open.id ? { ...p, endSeconds, addedSeconds: addedMinutes * 60 } : p,
      )
      const nextPhase = open.half === 1 ? 'break' : 'ended'
      const event: TimelineEvent = {
        id: nextId(),
        minute: open.half === 1 ? 45 : 90,
        kind: 'half-end',
        side: 'neutral',
        label: open.label,
      }
      return { ...m, phase: nextPhase, periods, events: [...m.events, event] }
    })
  }

  return {
    match,
    seconds,
    running,
    phase: match.phase,
    periods: match.periods,
    recordEvent,
    startMatch,
    startSecondHalf,
    endHalf,
    toggleRunning: () => setRunning((r) => !r),
  }
}
