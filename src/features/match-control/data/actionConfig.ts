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
  tone?: 'brand' | 'yellow' | 'red'
}

export interface ActionConfig {
  id: ActionKind
  /** Etiqueta del rail (dos palabras si aplica). */
  label: string
  title: string
  eventKind: EventKind
  showSide: boolean
  sideNeutral?: boolean
  showPlayers: boolean
  showSecondPlayers?: boolean
  secondLabel?: string
  optionsLabel?: string
  options?: ChoiceOption[]
  showAssist?: boolean
  showNote?: boolean
  noteLabel?: string
  showAddedMinutes?: boolean
  /** Acciones extra del menú "Más". */
  moreItems?: { id: ActionKind; label: string }[]
}

const TIPO_GOL: ChoiceOption[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'penalty', label: 'Penal' },
  { id: 'freekick', label: 'Tiro libre' },
  { id: 'own', label: 'Autogol' },
]

export const ACTIONS: Record<ActionKind, ActionConfig> = {
  goal: {
    id: 'goal',
    label: 'Gol',
    title: 'Registrar gol',
    eventKind: 'goal',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Tipo de gol',
    options: TIPO_GOL,
    showAssist: true,
  },
  card: {
    id: 'card',
    label: 'Tarjeta',
    title: 'Registrar tarjeta',
    eventKind: 'yellow',
    showSide: true,
    showPlayers: true,
    optionsLabel: 'Tipo de tarjeta',
    options: [
      { id: 'yellow', label: 'Amarilla', tone: 'yellow' },
      { id: 'red', label: 'Roja', tone: 'red' },
    ],
  },
  sub: {
    id: 'sub',
    label: 'Cambio',
    title: 'Registrar cambio',
    eventKind: 'sub',
    showSide: true,
    showPlayers: true,
    showSecondPlayers: true,
    secondLabel: 'Jugador que entra',
  },
  incident: {
    id: 'incident',
    label: 'Incidente',
    title: 'Registrar incidente',
    eventKind: 'incident',
    showSide: true,
    sideNeutral: true,
    showPlayers: false,
    optionsLabel: 'Tipo',
    options: [
      { id: 'injury', label: 'Lesión' },
      { id: 'object', label: 'Objeto en cancha' },
      { id: 'lighting', label: 'Iluminación' },
      { id: 'other', label: 'Otro' },
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
