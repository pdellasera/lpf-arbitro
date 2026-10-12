import type { ActionKind } from './actionConfig'

/** Pantallas del flujo de registro (Gol → Cambios → Sanciones → Lesionados → Incidencias). */
export type LiveSectionId = 'goal' | 'sub' | 'sanction' | 'injured' | 'incident'

export interface LiveSection {
  id: LiveSectionId
  label: string
  /** Acción del formulario de registro que se muestra en esta pantalla. */
  action: ActionKind
  /** Opción preseleccionada al abrir (p. ej. 'injury' en Lesionados). */
  preset?: string
}

export const LIVE_SECTIONS: LiveSection[] = [
  { id: 'goal', label: 'Gol', action: 'goal' },
  { id: 'sub', label: 'Cambios', action: 'sub' },
  { id: 'sanction', label: 'Sanciones', action: 'card' },
  { id: 'injured', label: 'Lesionados', action: 'injury', preset: 'injury' },
  { id: 'incident', label: 'Incidencias', action: 'incident' },
]
