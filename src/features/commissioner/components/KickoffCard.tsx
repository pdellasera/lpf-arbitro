import { Clock, Minus, Play, Plus, Timer } from 'lucide-react'

export type ExtraTimePeriod = 'first' | 'second'

interface KickoffCardProps {
  kickoff: string | null
  finalTime: string | null
  onRecordKickoff: () => void
  onRecordFinal: () => void
  extraTime: { first: number; second: number }
  onExtraTimeChange: (period: ExtraTimePeriod, minutes: number) => void
}

const MAX_EXTRA_MINUTES = 15

/** Tarjeta "Pitazo inicial + Pitazo final" (lado a lado) y "Tiempo extra por periodo". */
export function KickoffCard({
  kickoff,
  finalTime,
  onRecordKickoff,
  onRecordFinal,
  extraTime,
  onExtraTimeChange,
}: KickoffCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      {/* Pitazo inicial + Pitazo final (lado a lado) */}
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-center rounded-2xl border border-dashed border-tint-line bg-tint px-3 py-4">
          <p className="text-[13px] font-bold leading-tight text-ink">Pitazo inicial</p>
          <Clock className="mt-2 h-9 w-9 text-brand" strokeWidth={1.5} />
          <p data-start-time className="mt-1 text-[30px] font-extrabold leading-none tabular-nums text-ink">
            {kickoff ?? '--:--'}
          </p>
          <p className="mt-1 text-[12px] leading-tight text-ink-mute">Hora real de inicio</p>
          <button
            type="button"
            data-start-kickoff
            onClick={onRecordKickoff}
            className="mt-3 flex h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[14px] font-bold text-white transition-all duration-150 hover:bg-brand-hover active:scale-[0.98]"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Registrar
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center rounded-2xl border border-dashed border-tint-line bg-tint px-3 py-4">
          <p className="text-[13px] font-bold leading-tight text-ink">Pitazo final</p>
          <Clock className="mt-2 h-9 w-9 text-brand" strokeWidth={1.5} />
          <p data-start-final-time className="mt-1 text-[30px] font-extrabold leading-none tabular-nums text-ink">
            {finalTime ?? '--:--'}
          </p>
          <p className="mt-1 text-[12px] leading-tight text-ink-mute">Hora real de finalización</p>
          <button
            type="button"
            data-start-final-kickoff
            onClick={onRecordFinal}
            className="mt-3 flex h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-[14px] font-bold text-white transition-all duration-150 hover:bg-brand-hover active:scale-[0.98]"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Registrar
          </button>
        </div>
      </div>

      {/* Tiempo extra por periodo */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-brand" />
          <h3 className="text-[15px] font-extrabold text-ink">Tiempo extra por periodo</h3>
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          <ExtraTimeRow
            period="first"
            label="Primer tiempo"
            value={extraTime.first}
            onChange={(minutes) => onExtraTimeChange('first', minutes)}
          />
          <ExtraTimeRow
            period="second"
            label="Segundo tiempo"
            value={extraTime.second}
            onChange={(minutes) => onExtraTimeChange('second', minutes)}
          />
        </div>
      </div>
    </section>
  )
}

function ExtraTimeRow({
  period,
  label,
  value,
  onChange,
}: {
  period: ExtraTimePeriod
  label: string
  value: number
  onChange: (minutes: number) => void
}) {
  return (
    <div data-start-extra={period} className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2">
      <span className="text-[15px] font-bold leading-tight text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          data-start-extra-minus
          aria-label={`Restar ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-badge-gray text-ink transition-transform active:scale-95 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span data-start-extra-value className="w-12 text-center text-[16px] font-extrabold tabular-nums text-ink">
          {value} min
        </span>
        <button
          type="button"
          data-start-extra-plus
          aria-label={`Sumar ${label}`}
          onClick={() => onChange(Math.min(MAX_EXTRA_MINUTES, value + 1))}
          disabled={value >= MAX_EXTRA_MINUTES}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-badge-gray text-ink transition-transform active:scale-95 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
