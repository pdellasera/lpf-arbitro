import { useQuery } from '@tanstack/react-query'
import { fetchAppVersion } from '../api/authApi'

export function useAppVersion() {
  return useQuery({
    queryKey: ['app-version'],
    queryFn: fetchAppVersion,
  })
}
