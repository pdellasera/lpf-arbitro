import { cn } from '@/lib/cn'
import type { LineupPlayer, LiveMatch } from '../../types'

interface TeamLineupProps {
  name: string
  players: LineupPlayer[]
}

function TeamLineup({ name, players }: TeamLineupProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-badge-gray px-4 py-3">
        <span className="text-[15px] font-bold text-ink">{name}</span>
      </div>
      <div className="flex flex-col">
        {players.map((p, i) => (
          <div key={p.id} className={cn('flex items-center gap-3 px-4 py-2.5', i > 0 && 'border-t border-line')}>
            <span className="w-6 text-center text-[14px] font-extrabold tabular-nums text-ink-soft">{p.number}</span>
            <span className="flex-1 truncate text-[14px] font-semibold text-ink">{p.name}</span>
            <span className="text-[12px] text-ink-mute">{p.position}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AlineacionesTab({ match }: { match: LiveMatch }) {
  const home = match.players.filter((p) => p.side === 'home' && p.starter)
  const away = match.players.filter((p) => p.side === 'away' && p.starter)
  return (
    <div data-live-lineup className="flex flex-col gap-4">
      <TeamLineup name={match.home.name} players={home} />
      <TeamLineup name={match.away.name} players={away} />
    </div>
  )
}
