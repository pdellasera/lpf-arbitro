import { ArrowLeft } from 'lucide-react'

interface PreMatchTopBarProps {
  onBack: () => void
}

/** Cabecera navy de la Lista Previa (mismo patrón que MatchDetailHeader / LiveTopBar). */
export function PreMatchTopBar({ onBack }: PreMatchTopBarProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 bg-gradient-to-b from-header-top to-header-bottom">
      <div className="relative flex items-center justify-center px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[17px] font-bold leading-none tracking-tight text-white">Antes del partido</h1>
      </div>
    </header>
  )
}
