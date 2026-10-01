import { useState } from 'react'
import { useAllMatches } from '../hooks/useMatches'
import type { Match } from '../types'
import { AppDrawer } from './AppDrawer'
import { BottomNav } from './BottomNav'
import { HomeHero } from './HomeHero'
import { MatchCard } from './MatchCard'
import { MatchesEmptyState } from './MatchesEmptyState'

interface HomeScreenProps {
  onOpenMatch: (match: Match) => void
}

export function HomeScreen({ onOpenMatch }: HomeScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const schedule = useAllMatches()

  const days = schedule.data ?? []

  return (
    <div className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-page">
      <HomeHero onMenu={() => setDrawerOpen(true)} />

      <main className="relative z-10 -mt-6 flex-1 rounded-t-[24px] bg-page">
        <div className="flex flex-col gap-5 px-3 pb-28 pt-4">
          {days.map(({ day, matches }) => (
            <section key={day.date}>
              <div className="sticky top-0 z-10 -mx-3 mb-3 flex items-baseline justify-between bg-page px-4 py-2.5">
                <h2 className="text-[16px] font-extrabold leading-none text-ink">{day.label}</h2>
                <span className="text-[12px] text-ink-mute">{day.sublabel}</span>
              </div>
              <div className="flex flex-col gap-3">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onOpen={match.status === 'upcoming' ? () => onOpenMatch(match) : undefined}
                  />
                ))}
              </div>
            </section>
          ))}
          {!schedule.isLoading && days.length === 0 && <MatchesEmptyState />}
        </div>
      </main>

      <BottomNav />
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}


