import { motion } from 'framer-motion'
import { ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Match } from '../types'
import { MatchMeta } from './MatchMeta'
import { StatusBadge } from './StatusBadge'
import { TeamRow } from './TeamRow'

interface MatchCardProps {
  match: Match
  onOpen?: () => void
}

export function MatchCard({ match, onOpen }: MatchCardProps) {
  const upcoming = match.status === 'upcoming'
  const live = match.status === 'live'

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className={cn(
        'rounded-2xl border',
        upcoming ? 'border-[#0062fd] bg-[#eef4fe]' : 'border-[#eceef2] bg-white',
        onOpen && 'cursor-pointer transition-transform active:scale-[0.99]',
      )}
    >
      <header className="flex items-center justify-between px-4 pt-3.5">
        <StatusBadge label={match.badge} status={match.status} />

        <div className="flex items-center gap-1">
          {live ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#05b56b]" />
              <span className="text-[14px] font-bold text-[#05b56b]">{match.trailing}</span>
            </>
          ) : (
            <>
              <Clock className={cn('h-4 w-4', upcoming ? 'text-[#0062fd]' : 'text-ink-mute')} />
              <span className={cn('text-[15px] font-bold tabular-nums', upcoming ? 'text-[#0062fd]' : 'text-ink-soft')}>
                {match.trailing}
              </span>
            </>
          )}
          <ChevronRight className={cn('h-4 w-4', upcoming ? 'text-[#0062fd]' : 'text-ink-mute')} />
        </div>
      </header>

      <div className="px-4 pb-4 pt-2.5">
        <p className="text-[12.5px] text-ink-soft">
          {match.league} <span className="text-ink-mute">·</span> Jornada {match.jornada}
        </p>

        <div className="mt-3.5">
          <TeamRow home={match.home} away={match.away} score={match.score} />
        </div>

        <div className="my-3.5 h-px bg-[#eceef2]" />

        <MatchMeta items={match.meta} />
      </div>
    </motion.article>
  )
}
