// Lista previa (checklist de instalaciones y seguridad) del rol Comisionado.
//
// NOTA: los textos de `label`/`options` son valores de demostración ajustados al
// mockup de la LPF. Si el mockup cambia de redacción, basta editar este archivo.

export interface PreMatchItem {
  id: string
  label: string
  /** Posibles valores que se alternan al tocar la fila / "Cambiar". */
  options: string[]
  /** Índice de la opción seleccionada; -1 = sin seleccionar (estado inicial). */
  valueIndex: number
}

export const PRE_MATCH_CHECKLIST: PreMatchItem[] = [
  {
    id: 'uniforms',
    label: 'Similitud de uniformes',
    options: ['Sin similitud - ambos equipos OK', 'Hay similitud - revisar cambio'],
    valueIndex: -1,
  },
  {
    id: 'pitch',
    label: 'Estado del terreno',
    options: ['Óptimo - grama en buen estado', 'Con daños - notificar'],
    valueIndex: -1,
  },
  {
    id: 'lighting',
    label: 'Alumbrado',
    options: ['Funciona correctamente', 'Falla parcial'],
    valueIndex: -1,
  },
  {
    id: 'ballboys',
    label: 'Recoge balones',
    options: ['Presentes - 6 personas', 'Ausentes'],
    valueIndex: -1,
  },
  {
    id: 'security',
    label: 'Seguridad (Policía)',
    options: ['Presente - Policía Nacional', 'Ausente'],
    valueIndex: -1,
  },
  {
    id: 'civil',
    label: 'Protección Civil',
    options: ['Presente', 'Ausente'],
    valueIndex: -1,
  },
  {
    id: 'ambulances',
    label: 'Ambulancias',
    options: ['1 ambulancia presente', 'Sin ambulancia'],
    valueIndex: -1,
  },
]
