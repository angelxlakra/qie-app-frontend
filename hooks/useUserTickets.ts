import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { getUserTickets, type UserTicket } from '@/lib/events'

/**
 * Hook to fetch all tickets owned by a user across all events
 * Automatically uses the connected wallet address
 * Includes automatic caching and refetching via React Query
 */
export function useUserTickets() {
  const { address, isConnected } = useAccount()

  return useQuery({
    queryKey: ['user', 'tickets', address],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected')
      return getUserTickets(address)
    },
    enabled: isConnected && !!address,
    staleTime: 30 * 1000, // 30 seconds (user balances change frequently after purchases)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 60 * 1000, // Refetch every minute to keep balances updated
  })
}

/**
 * Hook to fetch tickets for a specific user address
 * Useful for viewing other users' tickets or admin purposes
 */
export function useUserTicketsForAddress(userAddress: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ['user', 'tickets', userAddress],
    queryFn: () => {
      if (!userAddress) throw new Error('User address is required')
      return getUserTickets(userAddress)
    },
    enabled: !!userAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}

/**
 * Hook to get tickets grouped by event
 * Useful for organizing display by event
 */
export function useUserTicketsGrouped() {
  const { data: tickets, ...rest } = useUserTickets()

  const groupedTickets = tickets?.reduce(
    (acc, ticket) => {
      const eventAddress = ticket.eventAddress
      if (!acc[eventAddress]) {
        acc[eventAddress] = {
          eventName: ticket.eventName,
          eventAddress: eventAddress,
          tickets: [],
        }
      }
      acc[eventAddress].tickets.push(ticket)
      return acc
    },
    {} as Record<
      string,
      { eventName: string; eventAddress: string; tickets: UserTicket[] }
    >
  )

  return {
    data: groupedTickets,
    tickets,
    ...rest,
  }
}

/**
 * Hook to check if user has any tickets
 * Useful for showing empty states
 */
export function useHasTickets() {
  const { data: tickets, isLoading } = useUserTickets()

  return {
    hasTickets: !!tickets && tickets.length > 0,
    ticketCount: tickets?.length ?? 0,
    isLoading,
  }
}
