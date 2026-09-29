import { ClipboardList, Settings, Whistle } from 'lucide-react'

export function TopQuickActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        aria-label="Silbato"
        className="flex h-[clamp(34px,7.4dvh,42px)] w-[clamp(34px,7.4dvh,42px)] items-center justify-center rounded-xl bg-[#0b1322]/85 text-[#8fb0dd] ring-1 ring-white/5"
      >
        <Whistle className="h-[clamp(18px,3.6dvh,22px)] w-[clamp(18px,3.6dvh,22px)]" />
      </button>
      <button
        type="button"
        aria-label="Informe"
        className="flex h-[clamp(34px,7.4dvh,42px)] w-[clamp(34px,7.4dvh,42px)] items-center justify-center rounded-xl bg-[#0b1322]/85 text-[#c4c9d4] ring-1 ring-white/5"
      >
        <ClipboardList className="h-[clamp(18px,3.6dvh,22px)] w-[clamp(18px,3.6dvh,22px)]" />
      </button>
      <span className="flex h-[clamp(28px,6dvh,32px)] items-center gap-1.5 rounded-full bg-[#011d1a]/85 pl-2.5 pr-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2fe07b]" />
        <span className="text-[clamp(12px,2.4dvh,14px)] font-semibold text-[#2fe07b]">En vivo</span>
      </span>
      <button
        type="button"
        aria-label="Ajustes"
        className="flex h-[clamp(24px,5.4dvh,28px)] w-[clamp(24px,5.4dvh,28px)] items-center justify-center text-white/70"
      >
        <Settings className="h-[clamp(16px,3.4dvh,20px)] w-[clamp(16px,3.4dvh,20px)]" />
      </button>
    </div>
  )
}
