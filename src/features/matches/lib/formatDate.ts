const formatter = new Intl.DateTimeFormat('es-PA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** "2025-09-28" → "Domingo, 28 de septiembre de 2025" */
export function formatLongDate(iso: string): string {
  const value = formatter.format(new Date(`${iso}T12:00:00`))
  return value.charAt(0).toUpperCase() + value.slice(1)
}
