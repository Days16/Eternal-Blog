import useSWR from 'swr'
import { fetcher } from '@/lib/utils/fetcher'

export type UserStats = {
  level: number
  xp: number
  role: string
  username: string
}

export function useUserStats(enabled: boolean = true) {
  const { data, error, mutate } = useSWR<UserStats>(
    enabled ? '/api/user/stats' : null,
    fetcher,
    {
      refreshInterval: 30000, // Refrescar cada 30 segundos
      revalidateOnFocus: true
    }
  )

  return {
    stats: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}
