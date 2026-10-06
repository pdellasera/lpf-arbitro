import { Bell, Clock } from 'lucide-react'
import { LpfLogo } from '@/components/ui/LpfLogo'

interface HomeHeaderProps {
  role: 'arbitro' | 'comisionado'
  onNotifications?: () => void
}

export function HomeHeader({ role, onNotifications }: HomeHeaderProps) {
  const label = role === 'arbitro' ? 'Árbitro' : 'Comisionado'

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-gradient-to-b from-header-top to-header-bottom">
      <div className="flex items-center justify-between px-4 pb-7 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <LpfLogo className="h-11 w-auto" />
          <div>
            <p className="text-[26px] font-extrabold leading-none tracking-tight text-white">LPF</p>
            <p className="mt-1 text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.06em] text-white/85">
              Liga Panameña
              <br />
              de Fútbol
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-[#2b2508] px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-gold-strong" />
            <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-gold-strong">{label}</span>
          </span>

          <button
            type="button"
            aria-label="Notificaciones"
            onClick={onNotifications}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <Bell className="h-6 w-6 text-white" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ef4444]" />
          </button>
        </div>
      </div>
    </header>
  )
}