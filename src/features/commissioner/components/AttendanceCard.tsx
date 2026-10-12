import { Users } from 'lucide-react'
import { MATCH_START_ATTENDANCE_CATEGORIES } from '../data/matchStartExtras'

interface AttendanceCardProps {
  values: Record<string, string>
  onChange: (id: string, value: string) => void
}

const sumAttendance = (values: Record<string, string>) =>
  MATCH_START_ATTENDANCE_CATEGORIES.reduce(
    (total, category) => total + (Number.parseInt(values[category.id] ?? '0', 10) || 0),
    0,
  )

/** Tarjeta "Asistencia total de fanáticos al estadio" (Comisionado). */
export function AttendanceCard({ values, onChange }: AttendanceCardProps) {
  const total = sumAttendance(values)
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-green-soft">
          <Users className="h-5 w-5 text-accent-green" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[19px] font-extrabold leading-tight tracking-tight text-ink">
            Asistencia total de fanáticos al estadio
          </h2>
          <p className="mt-1 text-[14px] leading-snug text-ink-soft">
            Desglose de la asistencia por categoría.
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <h3 className="text-[15px] font-extrabold text-ink">Desglosar la asistencia</h3>

        <div className="mt-3 flex flex-col gap-2.5">
          {MATCH_START_ATTENDANCE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2"
            >
              <label
                htmlFor={`attendance-${category.id}`}
                className="text-[15px] font-bold leading-tight text-ink"
              >
                {category.label}
              </label>
              <input
                id={`attendance-${category.id}`}
                data-start-attendance={category.id}
                inputMode="numeric"
                value={values[category.id] ?? ''}
                onChange={(e) => onChange(category.id, e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="h-11 w-24 rounded-xl border border-line bg-white px-3 text-right text-[15px] font-bold tabular-nums text-ink outline-none placeholder:text-ink-mute focus:border-brand"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-accent-blue-soft px-3 py-2.5">
          <span className="text-[15px] font-extrabold text-ink">Total</span>
          <span data-start-attendance-total className="text-[16px] font-extrabold tabular-nums text-brand">
            {total}
          </span>
        </div>
      </div>
    </section>
  )
}
