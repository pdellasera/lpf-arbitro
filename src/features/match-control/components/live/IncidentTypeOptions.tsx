import { PersonStanding, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ChoiceOption } from '../../data/actionConfig'

interface IncidentTypeOptionsProps {
  options: ChoiceOption[]
  value: string | null
  onSelect: (id: string) => void
}

/** Icono de cada tipo de incidencia: círculo (rojo/navy) o cuadrado rojo de invasión. */
function OptionIcon({ option, active }: { option: ChoiceOption; active: boolean }) {
  const tone = active ? 'bg-brand' : option.tone === 'navy' ? 'bg-card-top' : 'bg-[#e5342b]'

  if (option.icon === 'invasion') {
    return (
      <span
        className={cn(
          'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]',
          tone,
        )}
      >
        <PersonStanding className="h-5 w-5 text-white" strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full',
        tone,
      )}
    >
      <Plus className="h-5 w-5 text-white" strokeWidth={3} />
    </span>
  )
}

/** Lista vertical de tipos de incidencia estilo mockup (icono circular + etiqueta). */
export function IncidentTypeOptions({ options, value, onSelect }: IncidentTypeOptionsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            data-incident-option={o.id}
            aria-pressed={active}
            onClick={() => onSelect(o.id)}
            className={cn(
              'flex h-[58px] w-full items-center gap-3.5 rounded-xl border px-4 text-left transition-all active:scale-[0.99]',
              active
                ? 'border-brand bg-tint'
                : 'border-line bg-white shadow-[0_2px_6px_rgba(15,23,42,0.07)]',
            )}
          >
            <OptionIcon option={o} active={active} />
            <span className={cn('text-[16px] font-semibold', active ? 'text-brand' : 'text-ink')}>
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
