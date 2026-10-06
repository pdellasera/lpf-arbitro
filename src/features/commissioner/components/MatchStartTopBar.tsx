import { ArrowLeft } from 'lucide-react'

interface MatchStartTopBarProps {
  onBack: () => void
}

/** Cabecera navy de "Inicio del partido": título alineado a la izquierda, junto a la flecha. */
export function MatchStartTopBar({ onBack }: MatchStartTopBarProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 bg-gradient-to-b from-header-top to-header-bottom">
      <div className="flex items-center px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="ml-1 text-[17px] font-bold leading-none tracking-tight text-white">Inicio del partido</h1>
      </div>
    </header>
  )
}
