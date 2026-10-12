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

/** "15:30" → "3:30 PM" (formato 12 horas); null/vacío/inválido → "--:--". */
export function format12h(time: string | null): string {
  if (!time) return '--:--'
  const [hRaw = '', mRaw = ''] = time.split(':')
  const hours = Number.parseInt(hRaw, 10)
  const minutes = Number.parseInt(mRaw, 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '--:--'
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}
