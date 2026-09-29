import { Bell, Menu } from 'lucide-react'
import background from '@/assets/login_background.webp'
import { IconButton } from '@/components/ui/IconButton'

interface HomeHeroProps {
  onMenu: () => void
}

export function HomeHero({ onMenu }: HomeHeroProps) {
  return (
    <header className="relative h-[26vh] min-h-[220px] max-h-[272px] shrink-0 overflow-hidden bg-[#04121f]">
      <img
        src={background}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-[#04121f]/75" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-[max(0.875rem,env(safe-area-inset-top))]">
        <IconButton label="Abrir menú" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </IconButton>
        <IconButton label="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-black/40" />
        </IconButton>
      </div>

      <div className="absolute inset-x-0 bottom-5 px-5">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-white">Mis partidos</h1>
        <p className="mt-1 text-[14px] text-white/80">Partidos asignados como árbitro</p>
      </div>
    </header>
  )
}
