import { Volleyball, X } from 'lucide-react'

interface EventDrawerHeaderProps {
  title: string
  onClose: () => void
}

export function EventDrawerHeader({ title, onClose }: EventDrawerHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#80838e] hover:bg-white/10 short:h-7 short:w-7"
      >
        <X className="h-5 w-5 short:h-4 short:w-4" />
      </button>
      <Volleyball className="h-6 w-6 text-[#d9dbe0] short:h-5 short:w-5" />
      <h2 className="text-lg font-bold text-white short:text-base">{title}</h2>
    </div>
  )
}
