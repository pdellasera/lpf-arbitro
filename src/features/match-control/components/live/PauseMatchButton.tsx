import { Pause, Play } from 'lucide-react'

interface PauseMatchButtonProps {
  running: boolean
  onToggle: () => void
}

export function PauseMatchButton({ running, onToggle }: PauseMatchButtonProps) {
  return (
    <button
      type="button"
      data-pause-match
      onClick={onToggle}
      className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-2 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(9,30,66,0.18)] transition-transform active:scale-[0.98]"
    >
      {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      {running ? 'Pausar partido' : 'Reanudar partido'}
    </button>
  )
}
