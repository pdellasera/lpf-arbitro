import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Match } from '../types'
import { MatchInfo } from './MatchInfo'
import { StatusBadge } from './StatusBadge'
import { TeamRow } from './TeamRow'

interface MatchCardProps {
  match: Match
  onOpen?: () => void
}

export function MatchCard({ match, onOpen }: MatchCardProps) {
  const featured = Boolean(match.featured)
  const live = match.status === 'live'
  const emphasized = featured || live

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className={cn(
        'relative rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        onOpen && 'cursor-pointer transition-transform active:scale-[0.99]',
      )}
    >
      {featured && <span className="absolute inset-y-1.5 left-0 w-[5px] rounded-full bg-accent-green" />}

      <div className="px-4 py-3.5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {live && <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />}
            <span
              className={cn(
                'text-[20px] font-extrabold leading-none tabular-nums',
                emphasized ? 'text-accent-green' : 'text-ink',
              )}
            >
              {match.trailing}
            </span>
          </div>
          <StatusBadge label={match.badge} green={emphasized} />
        </header>

        <div className="mt-4">
          <TeamRow home={match.home} away={match.away} score={match.score} />
        </div>

        <div className="mt-3.5">
          <MatchInfo venue={match.venue} jornada={match.jornada} />
        </div>
      </div>

      {!featured && (
        <ChevronRight className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" />
      )}
    </motion.article>
  )
}
