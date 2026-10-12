import { Shirt } from 'lucide-react'
import type { YesNoValue } from '../data/matchStartDelays'
import { MATCH_START_UNIFORM_SIDES } from '../data/matchStartExtras'
import { YesNoToggle } from './YesNoToggle'

interface UniformSimilarityCardProps {
  values: Record<'local' | 'away', YesNoValue>
  detail: string
  onChange: (side: 'local' | 'away', value: YesNoValue) => void
  onDetailChange: (value: string) => void
}

/** Tarjeta "Similitud de uniformes" (Comisionado): Sí/No por equipo + detalle. */
export function UniformSimilarityCard({
  values,
  detail,
  onChange,
  onDetailChange,
}: UniformSimilarityCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-blue-soft">
          <Shirt className="h-5 w-5 text-brand" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[19px] font-extrabold leading-tight tracking-tight text-ink">
            Similitud de uniformes
          </h2>
          <p className="mt-1 text-[14px] leading-snug text-ink-soft">
            Indique si los uniformes de cada equipo pueden generar confusión.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {MATCH_START_UNIFORM_SIDES.map((side) => (
          <div
            key={side.id}
            data-start-uniform={side.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
          >
            <p className="min-w-0 flex-1 text-[15px] font-bold leading-tight text-ink">{side.label}</p>
            <YesNoToggle
              value={values[side.id] ?? 'no'}
              onSelect={(value) => onChange(side.id, value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor="uniform-detail" className="block text-[14px] font-bold text-ink">
          Detallar la similitud en los uniformes
        </label>
        <textarea
          id="uniform-detail"
          data-start-uniform-detail
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          rows={3}
          placeholder="Escribe aquí…"
          className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink shadow-[0_2px_6px_rgba(15,23,42,0.08)] outline-none placeholder:text-ink-mute focus:border-brand focus:shadow-[0_2px_8px_rgba(0,98,253,0.15)]"
        />
      </div>
    </section>
  )
}
