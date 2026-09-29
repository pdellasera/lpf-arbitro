import { CalendarX } from 'lucide-react'

export function MatchesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8dee6] bg-white px-6 py-14 text-center">
      <CalendarX className="h-8 w-8 text-ink-mute" />
      <p className="mt-3 text-[15px] font-semibold text-ink">No tienes partidos asignados</p>
      <p className="mt-1 text-[13px] text-ink-soft">No hay encuentros programados para este día.</p>
    </div>
  )
}
