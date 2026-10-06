import { ArrowLeft } from 'lucide-react'

interface ActaTopBarProps {
  onBack: () => void
}

/** Cabecera navy de la pantalla "Acta de finalización" (título + subtítulo). */
export function ActaTopBar({ onBack }: ActaTopBarProps) {
  return (
    <header className="relative shrink-0 bg-gradient-to-b from-header-top to-header-bottom px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="absolute left-4 top-[max(1.25rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <div className="flex flex-col items-center px-12 text-center">
        <h1 className="text-[22px] font-extrabold leading-none tracking-tight text-white">Acta de finalización</h1>
        <p className="mt-2 max-w-[300px] text-[14px] leading-snug text-white/85">
          Revisa la información del partido y firma para cerrar el acta.
        </p>
      </div>
    </header>
  )
}
