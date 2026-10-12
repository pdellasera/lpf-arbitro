// Configuración de las tarjetas exclusivas del Comisionado en "Inicio del partido":
// "Similitud de uniformes" y "Asistencia total de fanáticos al estadio".
// Los textos están centralizados aquí para ajustarlos al mockup oficial sin tocar la UI.

export interface UniformSide {
  id: 'local' | 'away'
  label: string
}

export const MATCH_START_UNIFORM_SIDES: UniformSide[] = [
  { id: 'local', label: 'Equipo local' },
  { id: 'away', label: 'Equipo visitante' },
]

export interface AttendanceCategory {
  id: 'general' | 'retired' | 'children' | 'courtesy'
  label: string
}

export const MATCH_START_ATTENDANCE_CATEGORIES: AttendanceCategory[] = [
  { id: 'general', label: 'General' },
  { id: 'retired', label: 'Jubilados' },
  { id: 'children', label: 'Niños' },
  { id: 'courtesy', label: 'Cortesías' },
]
