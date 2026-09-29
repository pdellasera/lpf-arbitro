import { useState } from 'react'
import { TODAY } from '../data/mockMatches'
import { useMatchesByDay, useMatchDays } from '../hooks/useMatches'
import type { Match } from '../types'
import { AppDrawer } from './AppDrawer'
import { BottomNav } from './BottomNav'
import { DaySelector } from './DaySelector'
import { HomeHero } from './HomeHero'
import { MatchCard } from './MatchCard'
import { MatchesEmptyState } from './MatchesEmptyState'

interface HomeScreenProps {
  onOpenMatch: (match: Match) => void
}

export function HomeScreen({ onOpenMatch }: HomeScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(TODAY)

  const days = useMatchDays()
  const matches = useMatchesByDay(selectedDate)

  return (
    <div className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-page">
      <HomeHero onMenu={() => setDrawerOpen(true)} />

      <main className="relative z-10 -mt-6 flex-1 rounded-t-[24px] bg-page">
        <DaySelector days={days.data ?? []} selected={selectedDate} onSelect={setSelectedDate} />

        <div className="flex flex-col gap-3 px-3 pb-28 pt-2">
          {(matches.data ?? []).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onOpen={match.status === 'upcoming' ? () => onOpenMatch(match) : undefined}
            />
          ))}
          {!matches.isLoading && matches.data?.length === 0 && <MatchesEmptyState />}
        </div>
      </main>

      <BottomNav />
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}

