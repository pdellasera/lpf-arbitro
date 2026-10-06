import type { EventKind } from '../types'

export type ActionKind =
  | 'goal'
  | 'card'
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
  | 'more'

export interface ChoiceOption {
  id: string
  label: string
  tone?: 'brand' | 'yellow' | 'red' | 'navy'
  /** Glifo del estilo lista: círculo `+` (rojo/navy) o cuadrado rojo de invasión. */
  icon?: 'plus' | 'card' | 'plus-red' | 'plus-navy' | 'invasion'
}

export interface ActionConfig {
  id: ActionKind
  /** Etiqueta del rail (dos palabras si aplica). */
  label: string
  /** Etiqueta abreviada para el panel compacto (`short`); si falta se usa `label`. */
  shortLabel?: string
  title: string
  /** Etiqueta del CTA de confirmación (por defecto `Guardar <label>`). */
  submitLabel?: string
  eventKind: EventKind
  showSide: boolean
  sideNeutral?: boolean
  showPlayers: boolean
  showSecondPlayers?: boolean
  secondLabel?: string
  /** Etiqueta del selector de bando (por defecto "Equipo"). */
  sideLabel?: string
  optionsLabel?: string
  options?: ChoiceOption[]
  /** `segmented` = fila de chips de texto; `cards` = tarjetas con icono (p.ej. tipo de tarjeta); `list` = filas verticales con icono (p.ej. tipo de incidencia). */
  optionsStyle?: 'segmented' | 'cards' | 'list'
  /** Si viene con preset desde el grid, oculta las demás opciones (elección única). */
  singleChoice?: boolean
  /** Mapea una opción elegida a su `EventKind` real (p.ej. tarjeta roja ≠ amarilla). */
  optionKinds?: Record<string, EventKind>
  showAssist?: boolean
  showNote?: boolean
  noteLabel?: string
  /** Placeholder del textarea de nota. */
  notePlaceholder?: string
  showReason?: boolean
  reasonLabel?: string
  /** Placeholder del input de texto libre del motivo. */
  reasonPlaceholder?: string
  showAddedMinutes?: boolean
  /** Acciones extra del menú "Más". */
  moreItems?: { id: ActionKind; label: string }[]
}

export const ACTIONS: Record<ActionKind, ActionConfig> = {
  goal: {
    id: 'goal',
    label: 'Gol',
    title: 'Registrar gol',
    submitLabel: 'Guardar gol',
    eventKind: 'goal',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Tipo de gol',
    options: [
      { id: 'open', label: 'Juego abierto' },
      { id: 'penalty', label: 'Penal' },
      { id: 'freekick', label: 'Tiro libre' },
    ],
    showNote: true,
    noteLabel: 'Observaciones (opcional)',
    notePlaceholder: 'Ej. Gran definición al ángulo…',
  },
  card: {
    id: 'card',
    label: 'Tarjeta',
    title: 'Registrar tarjeta',
    eventKind: 'yellow',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Tipo de tarjeta',
    optionsStyle: 'cards',
    singleChoice: true,
    options: [
      { id: 'yellow', label: 'Amarilla', tone: 'yellow', icon: 'plus' },
      { id: 'red', label: 'Roja', tone: 'red', icon: 'card' },
    ],
    optionKinds: { yellow: 'yellow', red: 'red' },
    showReason: true,
    reasonLabel: 'Motivo',
    reasonPlaceholder: 'Ej. Juego brusco',
    showNote: true,
    noteLabel: 'Observaciones (opcional)',
    notePlaceholder: 'Ej. Entrada fuerte sin disputa del balón…',
  },
  sub: {
    id: 'sub',
    label: 'Cambio',
    title: 'Registrar cambio',
    submitLabel: 'Guardar cambio',
    eventKind: 'sub',
    showSide: true,
    showPlayers: true,
    showSecondPlayers: true,
    secondLabel: 'Jugador que ingresa',
    showNote: true,
    noteLabel: 'Observaciones (opcional)',
    notePlaceholder: 'Ej. Cambio táctico…',
  },
  incident: {
    id: 'incident',
    label: 'Incidencia',
    title: 'Registrar incidencia',
    submitLabel: 'Guardar incidencia',
    eventKind: 'incident',
    showSide: false,
    showPlayers: false,
    optionsLabel: 'Tipo de incidencia',
    optionsStyle: 'list',
    options: [
      { id: 'injury', label: 'Lesión', tone: 'red', icon: 'plus-red' },
      { id: 'misconduct', label: 'Conducta antideportiva', tone: 'red', icon: 'plus-red' },
      { id: 'delay', label: 'Demora de juego', tone: 'red', icon: 'plus-red' },
      { id: 'invasion', label: 'Invasión de campo', tone: 'red', icon: 'invasion' },
      { id: 'other', label: 'Otro', tone: 'navy', icon: 'plus-navy' },
    ],
    showNote: true,
    noteLabel: 'Descripción',
  },
  foul: {
    id: 'foul',
    label: 'Falta',
    title: 'Registrar falta',
    eventKind: 'foul',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Tipo de falta',
    options: [
      { id: 'simple', label: 'Simple' },
      { id: 'tactical', label: 'Táctica' },
      { id: 'hard', label: 'Dura' },
    ],
  },
  freekick: {
    id: 'freekick',
    label: 'Tiro libre',
    shortLabel: 'T. libre',
    title: 'Registrar tiro libre',
    eventKind: 'freekick',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Tipo',
    options: [
      { id: 'direct', label: 'Directo' },
      { id: 'indirect', label: 'Indirecto' },
    ],
  },
  corner: {
    id: 'corner',
    label: 'Tiro de esquina',
    shortLabel: 'Esquina',
    title: 'Registrar tiro de esquina',
    eventKind: 'corner',
    showSide: true,
    showPlayers: true,
  },
  penalty: {
    id: 'penalty',
    label: 'Penal',
    title: 'Registrar penal',
    eventKind: 'penalty',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Resultado',
    options: [
      { id: 'goal', label: 'Gol' },
      { id: 'miss', label: 'Fallado' },
    ],
    showAssist: true,
  },
  'goal-disallowed': {
    id: 'goal-disallowed',
    label: 'Gol anulado',
    title: 'Registrar gol anulado',
    eventKind: 'goal-disallowed',
    showSide: true,
    showPlayers: true,
    showNote: true,
    noteLabel: 'Motivo',
  },
  var: {
    id: 'var',
    label: 'VAR',
    title: 'Revisión VAR',
    submitLabel: 'Guardar revisión',
    eventKind: 'var',
    showSide: true,
    sideNeutral: true,
    showPlayers: false,
    optionsLabel: 'Revisión',
    options: [
      { id: 'goal', label: 'Gol' },
      { id: 'card', label: 'Tarjeta' },
      { id: 'offside', label: 'Fuera de juego' },
      { id: 'other', label: 'Otro' },
    ],
  },
  'added-time': {
    id: 'added-time',
    label: 'Tiempo añadido',
    title: 'Tiempo añadido',
    eventKind: 'added-time',
    showSide: false,
    showPlayers: false,
  },
  saque: {
    id: 'saque',
    label: 'Saque de meta',
    title: 'Registrar saque de meta',
    eventKind: 'saque',
    showSide: true,
    showPlayers: false,
  },
  'half-end': {
    id: 'half-end',
    label: 'Fin de parte',
    title: 'Finalizar parte',
    submitLabel: 'Finalizar parte',
    eventKind: 'half-end',
    showSide: false,
    showPlayers: false,
    showNote: true,
    noteLabel: 'Observación',
    showAddedMinutes: true,
  },
  more: {
    id: 'more',
    label: 'Más',
    title: 'Más acciones',
    eventKind: 'incident',
    showSide: false,
    showPlayers: false,
    moreItems: [
      { id: 'penalty', label: 'Penal' },
      { id: 'saque', label: 'Saque de meta' },
      { id: 'goal-disallowed', label: 'Gol anulado' },
      { id: 'var', label: 'VAR' },
      { id: 'added-time', label: 'Tiempo añadido' },
      { id: 'half-end', label: 'Fin de parte' },
    ],
  },
}

export const RAIL_ORDER: ActionKind[] = [
  'goal',
  'card',
  'sub',
  'incident',
  'foul',
  'freekick',
  'corner',
  'more',
]
