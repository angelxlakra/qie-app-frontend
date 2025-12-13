import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { getTierInfo, publicClient, type TierData } from '@/lib/events'
import EventABI from '@/abis/Event.json'

/**
 * Hook to fetch information for a specific tier
 * Includes automatic caching and refetching via React Query
 */
export function useTierInfo(
  eventAddress: `0x${string}` | undefined,
  tierId: bigint | undefined
) {
  return useQuery({
    queryKey: ['tier', 'info', eventAddress, tierId?.toString()],
    queryFn: () => {
      if (!eventAddress) throw new Error('Event address is required')
      if (tierId === undefined) throw new Error('Tier ID is required')
      return getTierInfo(eventAddress, tierId)
    },
    enabled: !!eventAddress && tierId !== undefined,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for availability updates
  })
}

/**
 * Hook to fetch tier info along with user's balance for that tier
 * Useful for ticket purchase pages and user portfolio
 */
export function useTierInfoWithBalance(
  eventAddress: `0x${string}` | undefined,
  tierId: bigint | undefined
) {
  const { address, isConnected } = useAccount()

  const tierInfo = useTierInfo(eventAddress, tierId)

  const balance = useQuery({
    queryKey: ['tier', 'balance', eventAddress, tierId?.toString(), address],
    queryFn: async () => {
      if (!eventAddress || tierId === undefined || !address) {
        throw new Error('Missing required parameters')
      }

      const result = await publicClient.readContract({
        address: eventAddress,
        abi: EventABI,
        functionName: 'balanceOf',
        args: [address, tierId],
      })

      return result as bigint
    },
    enabled: !!eventAddress && tierId !== undefined && isConnected && !!address,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  })

  return {
    tierInfo: tierInfo.data,
    userBalance: balance.data,
    isLoading: tierInfo.isLoading || balance.isLoading,
    isError: tierInfo.isError || balance.isError,
    error: tierInfo.error || balance.error,
    refetch: () => {
      tierInfo.refetch()
      balance.refetch()
    },
  }
}

/**
 * Hook to check if a tier is available for purchase
 * Includes both availability check and active status
 */
export function useTierAvailability(
  eventAddress: `0x${string}` | undefined,
  tierId: bigint | undefined
) {
  const { data: tierInfo, isLoading } = useTierInfo(eventAddress, tierId)

  return {
    isAvailable: !!tierInfo && tierInfo.available > 0n && tierInfo.active,
    available: tierInfo?.available ?? 0n,
    isActive: tierInfo?.active ?? false,
    isSoldOut: tierInfo ? tierInfo.available === 0n : false,
    isLoading,
    tierInfo,
  }
}

/**
 * Hook to get tier price in different formats
 * Useful for displaying prices in UI
 */
export function useTierPrice(
  eventAddress: `0x${string}` | undefined,
  tierId: bigint | undefined
) {
  const { data: tierInfo } = useTierInfo(eventAddress, tierId)

  return {
    priceWei: tierInfo?.price,
    priceEth: tierInfo?.price ? Number(tierInfo.price) / 1e18 : undefined,
    formattedPrice: tierInfo?.price
      ? `${(Number(tierInfo.price) / 1e18).toFixed(4)} QIE`
      : undefined,
  }
}

/**
 * Hook to calculate total cost for multiple tickets
 * Useful for purchase flows with quantity selectors
 */
export function useTierTotalCost(
  eventAddress: `0x${string}` | undefined,
  tierId: bigint | undefined,
  quantity: number
) {
  const { data: tierInfo } = useTierInfo(eventAddress, tierId)

  const totalCostWei = tierInfo?.price ? tierInfo.price * BigInt(quantity) : 0n
  const totalCostEth = Number(totalCostWei) / 1e18

  return {
    totalCostWei,
    totalCostEth,
    formattedTotalCost: `${totalCostEth.toFixed(4)} QIE`,
    pricePerTicket: tierInfo?.price,
    quantity,
  }
}
