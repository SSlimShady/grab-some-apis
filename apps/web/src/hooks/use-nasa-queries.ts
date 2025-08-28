/**
 * TanStack Query hooks for NASA API data fetching
 */

import { fetchAPOD } from '@/lib/api/nasa-api'
import { APODRequest } from '@/types/nasa'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query keys for consistent caching
export const nasaKeys = {
  all: ['nasa'] as const,
  apods: () => [...nasaKeys.all, 'apod'] as const,
  apod: (params: APODRequest) => [...nasaKeys.apods(), params] as const,
  random: (count: number) => [...nasaKeys.apods(), 'random', count] as const,
}

/**
 * Hook for fetching APOD by date
 */
export function useAPODByDate(date: string) {
  return useQuery({
    queryKey: nasaKeys.apod({ date }),
    queryFn: () => fetchAPOD({ date }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
    refetchOnWindowFocus: false,
    enabled: !!date,
  })
}

/**
 * Hook for fetching random APODs
 */
export function useAPODRandom(count: number = 1) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: nasaKeys.random(count),
    queryFn: () => fetchAPOD({ count }),
    staleTime: 0, // Always fresh for random queries
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: false, // Manual refetch only
    select: data => {
      // Cache individual APODs from random results
      if (Array.isArray(data)) {
        data.forEach(apod => {
          queryClient.setQueryData(nasaKeys.apod({ date: apod.date }), apod, {
            updatedAt: Date.now(),
          })
        })
      }
      return data
    },
  })
}

/**
 * Hook for fetching APOD date range
 */
export function useAPODRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: nasaKeys.apod({ start_date: startDate, end_date: endDate }),
    queryFn: () => fetchAPOD({ start_date: startDate, end_date: endDate }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    enabled: !!(startDate && endDate),
  })
}

/**
 * Mutation hook for prefetching APOD data
 */
export function usePrefetchAPOD() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: APODRequest) => {
      const data = await fetchAPOD(params)

      // Cache the result
      queryClient.setQueryData(nasaKeys.apod(params), data)

      return data
    },
    onError: error => {
      if (typeof window !== 'undefined') {
        console.warn('Failed to prefetch APOD:', error)
      }
    },
  })
}

/**
 * Hook to prefetch adjacent dates for better UX
 */
export function usePrefetchAdjacentDates(currentDate: string) {
  const queryClient = useQueryClient()

  const prefetchDate = async (date: string) => {
    await queryClient.prefetchQuery({
      queryKey: nasaKeys.apod({ date }),
      queryFn: () => fetchAPOD({ date }),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchAdjacent = async () => {
    const current = new Date(currentDate)
    const yesterday = new Date(current)
    const tomorrow = new Date(current)

    yesterday.setDate(current.getDate() - 1)
    tomorrow.setDate(current.getDate() + 1)

    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    // Prefetch yesterday (always useful)
    if (yesterdayStr >= '1995-06-16') {
      prefetchDate(yesterdayStr)
    }

    // Prefetch tomorrow only if it's not in the future
    if (tomorrowStr <= todayStr) {
      prefetchDate(tomorrowStr)
    }
  }

  return { prefetchAdjacent }
}

/**
 * Utility hook to invalidate NASA queries
 */
export function useInvalidateNASAQueries() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: nasaKeys.all })
  }

  const invalidateAPODs = () => {
    queryClient.invalidateQueries({ queryKey: nasaKeys.apods() })
  }

  const invalidateAPOD = (params: APODRequest) => {
    queryClient.invalidateQueries({ queryKey: nasaKeys.apod(params) })
  }

  return {
    invalidateAll,
    invalidateAPODs,
    invalidateAPOD,
  }
}
