import type { LucideIcon } from 'lucide-react'

interface FinishHalfButtonProps {
  label: string
  icon: LucideIcon
  disabled?: boolean
  onClick: () => void
}

export function FinishHalfButton({ label, icon: Icon, disabled = false, onClick }: FinishHalfButtonProps) {
  return (
    <button
      type="button"
      data-finish-half
      disabled={disabled}
      onClick={onClick}
      className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-header-bottom/15 bg-white px-2 text-[15px] font-bold text-header-bottom shadow-[0_10px_24px_rgba(9,30,66,0.08)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="leading-tight">{label}</span>
    </button>
  )
}
