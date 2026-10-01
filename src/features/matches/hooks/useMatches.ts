import { useQuery } from '@tanstack/react-query'
import { fetchAllMatches, fetchMatchDays, fetchMatchesByDay } from '../api/matchesApi'

export function useMatchDays() {
  return useQuery({ queryKey: ['match-days'], queryFn: fetchMatchDays })
}

export function useMatchesByDay(date: string) {
  return useQuery({ queryKey: ['matches', date], queryFn: () => fetchMatchesByDay(date) })
}

export function useAllMatches() {
  return useQuery({ queryKey: ['matches', 'all'], queryFn: fetchAllMatches })
}
