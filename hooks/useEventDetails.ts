import { useQuery } from '@tanstack/react-query'
import { getEventDetails, getEventTiers, type EventDetails, type TierData } from '@/lib/events'

/**
 * Hook to fetch event details (name, symbol, accessPassNFT)
 * Includes automatic caching and refetching via React Query
 */
export function useEventDetails(eventAddress: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ['event', 'details', eventAddress],
    queryFn: () => {
      if (!eventAddress) throw new Error('Event address is required')
      return getEventDetails(eventAddress)
    },
    enabled: !!eventAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  })
}

/**
 * Hook to fetch event tiers with availability information
 * Includes automatic caching and refetching via React Query
 */
export function useEventTiers(eventAddress: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ['event', 'tiers', eventAddress],
    queryFn: () => {
      if (!eventAddress) throw new Error('Event address is required')
      return getEventTiers(eventAddress)
    },
    enabled: !!eventAddress,
    staleTime: 1 * 60 * 1000, // 1 minute (tiers can change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds to keep availability up-to-date
  })
}

/**
 * Combined hook to fetch both event details and tiers
 * Useful for event detail pages
 */
export function useEventDetailsWithTiers(eventAddress: `0x${string}` | undefined) {
  const details = useEventDetails(eventAddress)
  const tiers = useEventTiers(eventAddress)

  return {
    details: details.data,
    tiers: tiers.data,
    isLoading: details.isLoading || tiers.isLoading,
    isError: details.isError || tiers.isError,
    error: details.error || tiers.error,
    refetch: () => {
      details.refetch()
      tiers.refetch()
    },
  }
}
