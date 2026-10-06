import { ArrowLeft, Bell } from 'lucide-react'

interface EditScreenTopBarProps {
  title: string
  onBack: () => void
}

/** Cabecera oscura de las pantallas de registro (p. ej. "Registrar gol"). */
export function EditScreenTopBar({ title, onBack }: EditScreenTopBarProps) {
  return (
    <header className="relative flex shrink-0 items-center justify-center bg-gradient-to-b from-header-top to-header-bottom px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[0_2px_10px_rgba(10,28,52,0.3)]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h1 className="text-[17px] font-bold leading-none tracking-tight text-white">{title}</h1>
      <button
        type="button"
        aria-label="Notificaciones"
        className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
      >
        <Bell className="h-6 w-6" />
      </button>
    </header>
  )
}
