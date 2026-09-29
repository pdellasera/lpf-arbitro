import { ClipboardList, Settings, Whistle } from 'lucide-react'

export function TopQuickActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        aria-label="Silbato"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1322]/85 text-[#8fb0dd] ring-1 ring-white/5"
      >
        <Whistle className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Informe"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1322]/85 text-[#c4c9d4] ring-1 ring-white/5"
      >
        <ClipboardList className="h-5 w-5" />
      </button>
      <span className="flex h-8 items-center gap-1.5 rounded-full bg-[#011d1a]/85 pl-2.5 pr-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2fe07b]" />
        <span className="text-sm font-semibold text-[#2fe07b]">En vivo</span>
      </span>
      <button
        type="button"
        aria-label="Ajustes"
        className="flex h-7 w-7 items-center justify-center text-white/70"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  )
}
