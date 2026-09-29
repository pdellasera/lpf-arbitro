import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import type { LineupPlayer } from '../../types'

interface PlayerPickListProps {
  players: LineupPlayer[]
  value: string | null
  onSelect: (id: string) => void
  placeholder?: string
}

export function PlayerPickList({ players, value, onSelect, placeholder = 'Buscar jugador...' }: PlayerPickListProps) {
  const [q, setQ] = useState('')
  const filtered = players.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex h-11 items-center gap-2.5 rounded-xl bg-[#0d1f32] px-3.5">
        <Search className="h-[18px] w-[18px] shrink-0 text-[#8ca0b5]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5">
        {filtered.map((p) => {
          const active = p.id === value
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                'flex h-14 w-full items-center gap-2.5 rounded-xl px-2.5 text-left transition-colors',
                active ? 'bg-[#12263b]' : 'hover:bg-white/5',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                  active ? 'bg-[#285093] text-white' : 'text-[#8d9aa5]',
                )}
              >
                {p.number}
              </span>
              <PlayerAvatar src={p.avatar} name={p.name} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                <span className="block text-xs text-[#a3b1c1]">{p.position}</span>
              </span>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-[#0062fd] text-white' : 'border-2 border-white/20 text-transparent',
                )}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-2.5 py-2 text-[13px] text-[#8d9aa5]">Sin resultados</p>
        )}
      </div>
    </div>
  )
}
