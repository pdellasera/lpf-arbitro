import { ArrowLeft, Bell, ClipboardList, Users } from 'lucide-react'

interface EditScreenTopBarProps {
  title: string
  onBack: () => void
  onLineup?: () => void
  onLogs?: () => void
}

/** Cabecera oscura de las pantallas de registro (p. ej. "Registrar gol"). */
export function EditScreenTopBar({ title, onBack, onLineup, onLogs }: EditScreenTopBarProps) {
  return (
    <header className="relative sticky top-0 z-30 flex shrink-0 items-center justify-center bg-gradient-to-b from-header-top to-header-bottom px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[0_2px_10px_rgba(10,28,52,0.3)]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform active:scale-95"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h1 className="text-[17px] font-bold leading-none tracking-tight text-white">{title}</h1>
      <div className="absolute right-3 flex items-center gap-0.5">
        {onLineup && (
          <button
            type="button"
            onClick={onLineup}
            aria-label="Alineaciones"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform active:scale-95"
          >
            <Users className="h-5 w-5" />
          </button>
        )}
        {onLogs && (
          <button
            type="button"
            onClick={onLogs}
            aria-label="Logs"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform active:scale-95"
          >
            <ClipboardList className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          aria-label="Notificaciones"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform active:scale-95"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
