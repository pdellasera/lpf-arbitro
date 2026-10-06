import { ClipboardList, Scan, Users, type LucideIcon } from 'lucide-react'
import type { ActionKind } from './actionConfig'

/** Tipo visual de cada celda del grid de acciones rápidas. */
export type GridItemKind = 'ball' | 'yellow' | 'red' | 'sub' | 'injury' | 'incident' | 'more'

export interface LiveGridItem {
  id: ActionKind
  label: string
  kind: GridItemKind
  /** Opción preseleccionada en el panel (p.ej. color de tarjeta o tipo de incidente). */
  preset?: string
}

/** Grid de acciones rápidas del panel "Eventos". */
export const LIVE_GRID: LiveGridItem[] = [
  { id: 'goal', label: 'Gol', kind: 'ball' },
  { id: 'card', label: 'Tarjeta amarilla', kind: 'yellow', preset: 'yellow' },
  { id: 'card', label: 'Tarjeta roja', kind: 'red', preset: 'red' },
  { id: 'sub', label: 'Cambio', kind: 'sub' },
  { id: 'incident', label: 'Lesión', kind: 'injury', preset: 'injury' },
  { id: 'incident', label: 'Incidencias', kind: 'incident' },
]

export type LiveTabId = 'events' | 'lineup' | 'logs'

export interface LiveTab {
  id: LiveTabId
  label: string
  icon: LucideIcon
}

/** Pestañas superiores del panel de partido en vivo. */
export const LIVE_TABS: LiveTab[] = [
  { id: 'events', label: 'Eventos', icon: Scan },
  { id: 'lineup', label: 'Alineaciones', icon: Users },
  { id: 'logs', label: 'Logs', icon: ClipboardList },
]

