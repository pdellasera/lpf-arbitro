import { useState } from 'react'
import { useMatchesByDay, useMatchDays } from '../hooks/useMatches'
import type { Match } from '../types'
import { AppDrawer } from './AppDrawer'
import { BottomNav } from './BottomNav'
import { DaySelector } from './DaySelector'
import { HomeHeader } from './HomeHeader'
import { MatchCard } from './MatchCard'
import { MatchesEmptyState } from './MatchesEmptyState'

interface HomeScreenProps {
  role: 'arbitro' | 'comisionado'
  onOpenMatch: (match: Match) => void
}

export function HomeScreen({ role, onOpenMatch }: HomeScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const daysQuery = useMatchDays()
  const days = daysQuery.data ?? []
  const activeDay = selected ?? days[0]?.date ?? ''

  const matchesQuery = useMatchesByDay(activeDay)
  const matches = matchesQuery.data ?? []

  return (
    <div className="app-h relative mx-auto flex w-full max-w-[430px] flex-col bg-header-bottom">
      <HomeHeader role={role} />

      <main className="flex-1 rounded-t-[28px] bg-page">
        <div className="px-4 pt-5">
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-ink">Mis partidos</h1>
        </div>

        <div className="mt-4">
          <DaySelector days={days} selected={activeDay} onSelect={setSelected} />
        </div>

        <div className="mt-4 flex flex-col gap-3 px-4 pb-28">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} onOpen={() => onOpenMatch(match)} />
          ))}
          {!matchesQuery.isLoading && matches.length === 0 && <MatchesEmptyState />}
        </div>
      </main>

      <BottomNav onProfile={() => setDrawerOpen(true)} />
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}


