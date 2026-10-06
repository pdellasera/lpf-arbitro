import { Clock, House, UsersRound, type LucideIcon } from 'lucide-react'

// Preguntas de "Retrasos durante el partido" (Inicio del partido del Comisionado).
// Los textos están centralizados aquí para ajustarlos al mockup oficial sin tocar la UI.
// Por defecto la respuesta es "No" (así lo muestra el mockup).

export type YesNoValue = 'yes' | 'no'

export interface MatchStartDelay {
  id: 'local' | 'away' | 'other'
  label: string
  icon: LucideIcon
  defaultValue: YesNoValue
}

export const MATCH_START_DELAYS: MatchStartDelay[] = [
  { id: 'local', label: '¿Hubo retraso del equipo local?', icon: House, defaultValue: 'no' },
  { id: 'away', label: '¿Hubo retraso del equipo visitante?', icon: UsersRound, defaultValue: 'no' },
  { id: 'other', label: '¿Otros retrasos?', icon: Clock, defaultValue: 'no' },
]
