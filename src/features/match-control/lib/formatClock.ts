/** Formatea segundos como reloj de partido `mm:ss` (ej. 1397 → "23:17"). */
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
