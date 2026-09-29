import { Check, Flag, ListChecks, Play, Whistle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MatchPhase } from '../types'

interface MatchPhaseControlProps {
  phase: MatchPhase
  periodsCount: number
  onPrimary: () => void
  onRegistry: () => void
}

const PHASE_CONFIG: Record<
  MatchPhase,
  { label: string; icon: typeof Whistle; tone: string; disabled?: boolean }
> = {
  pre: { label: 'Pitido inicial', icon: Whistle, tone: 'bg-[#0060fd] text-white' },
  first: { label: 'Fin 1ª parte', icon: Flag, tone: 'bg-[#dcb90a] text-[#08131f]' },
  break: { label: 'Inicio 2ª parte', icon: Play, tone: 'bg-[#0060fd] text-white' },
  second: { label: 'Finalizar partido', icon: Flag, tone: 'bg-[#c80313] text-white' },
  ended: { label: 'Finalizado', icon: Check, tone: 'bg-[#0f2135] text-white/60', disabled: true },
}

export function MatchPhaseControl({ phase, periodsCount, onPrimary, onRegistry }: MatchPhaseControlProps) {
  const cfg = PHASE_CONFIG[phase]
  const Icon = cfg.icon

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onPrimary}
        disabled={cfg.disabled}
        aria-label={cfg.label}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-xl px-2 py-2.5 text-left transition-colors',
          cfg.tone,
          cfg.disabled ? 'cursor-default' : 'hover:brightness-110',
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="text-[11px] font-bold leading-tight">{cfg.label}</span>
      </button>

      <button
        type="button"
        onClick={onRegistry}
        disabled={periodsCount === 0}
        aria-label="Registro de partes"
        className={cn(
          'flex w-full items-center gap-1.5 rounded-xl bg-[#0f2135]/80 px-2 py-2.5 text-left transition-colors',
          periodsCount === 0 ? 'cursor-default opacity-50' : 'hover:bg-[#0f2135]',
        )}
      >
        <ListChecks className="h-5 w-5 shrink-0 text-white/80" />
        <span className="text-[11px] font-bold leading-tight text-white/90">Registro</span>
      </button>
    </div>
  )
}
