import { createPublicClient, http } from 'viem'
import { qieTestnet } from '@/config/chains'
import { querySubgraph } from '@/config/subgraph'
import {
  GET_ALL_EVENTS,
  GET_EVENT_BY_ADDRESS,
  GET_EVENT_TIERS,
  GET_USER_TICKETS,
} from '@/lib/subgraph/queries'
import type {
  EventsQueryResponse,
  EventQueryResponse,
  TiersQueryResponse,
  TicketBalancesQueryResponse,
  SubgraphEvent,
  SubgraphTier,
} from '@/lib/subgraph/types'

/**
 * Public client for fallback contract reads if needed
 * Now primarily using subgraph for all data fetching
 */
export const publicClient = createPublicClient({
  chain: qieTestnet,
  transport: http(),
})

// ============================================================================
// Type Definitions (kept for backward compatibility)
// ============================================================================

export interface EventData {
  eventAddress: `0x${string}`
  creator: `0x${string}`
  name: string
  eventId: bigint
  blockNumber: bigint
  transactionHash: `0x${string}`
}

export interface EventDetails {
  address: `0x${string}`
  name: string
  symbol: string
  accessPassNFT: `0x${string}`
}

export interface TierData {
  tierId: bigint
  tierName: string
  price: bigint
  maxSupply: bigint
  currentSupply: bigint
  available: bigint
  active: boolean
}

export interface UserTicket {
  eventAddress: `0x${string}`
  eventName: string
  tierId: bigint
  tierName: string
  balance: bigint
  price: bigint
}

// ============================================================================
// Helper Functions for Type Conversion
// ============================================================================

/**
 * Convert subgraph event to EventData format
 */
function subgraphEventToEventData(event: SubgraphEvent): EventData {
  return {
    eventAddress: event.id as `0x${string}`,
    creator: event.creator as `0x${string}`,
    name: event.name,
    eventId: BigInt(event.eventId),
    blockNumber: BigInt(event.createdAtBlock),
    transactionHash: event.transactionHash as `0x${string}`,
  }
}

/**
 * Convert subgraph event to EventDetails format
 */
function subgraphEventToEventDetails(event: SubgraphEvent): EventDetails {
  return {
    address: event.id as `0x${string}`,
    name: event.name,
    symbol: event.symbol,
    accessPassNFT: event.accessPassNFT as `0x${string}`,
  }
}

/**
 * Convert subgraph tier to TierData format
 */
function subgraphTierToTierData(tier: SubgraphTier): TierData {
  const maxSupply = BigInt(tier.maxSupply)
  const currentSupply = BigInt(tier.currentSupply)

  return {
    tierId: BigInt(tier.tierId),
    tierName: tier.tierName,
    price: BigInt(tier.price),
    maxSupply,
    currentSupply,
    available: maxSupply - currentSupply,
    active: tier.active,
  }
}

// ============================================================================
// Main Data Fetching Functions (now using Subgraph)
// ============================================================================

/**
 * Fetch all events created via EventFactory
 * Now uses subgraph instead of parsing logs
 */
export async function getAllEvents(): Promise<EventData[]> {
  try {
    const data = await querySubgraph<EventsQueryResponse>(GET_ALL_EVENTS, {
      first: 1000,
      skip: 0,
      orderBy: 'createdAtTimestamp',
      orderDirection: 'desc',
    })

    return data.events.map(subgraphEventToEventData)
  } catch (error) {
    console.error('Error fetching events from subgraph:', error)
    return []
  }
}

/**
 * Get basic event details (name, symbol, accessPassNFT address)
 * Now uses subgraph instead of contract reads
 */
export async function getEventDetails(
  eventAddress: `0x${string}`
): Promise<EventDetails> {
  try {
    const data = await querySubgraph<EventQueryResponse>(GET_EVENT_BY_ADDRESS, {
      address: eventAddress.toLowerCase(),
    })

    if (!data.event) {
      throw new Error(`Event not found: ${eventAddress}`)
    }

    return subgraphEventToEventDetails(data.event)
  } catch (error) {
    console.error('Error fetching event details from subgraph:', error)
    throw error
  }
}

/**
 * Get all tiers for an event
 * Now uses subgraph instead of parsing logs and contract reads
 */
export async function getEventTiers(
  eventAddress: `0x${string}`
): Promise<TierData[]> {
  try {
    const data = await querySubgraph<TiersQueryResponse>(GET_EVENT_TIERS, {
      eventAddress: eventAddress.toLowerCase(),
    })

    return data.tiers.map(subgraphTierToTierData)
  } catch (error) {
    console.error('Error fetching tiers from subgraph:', error)
    return []
  }
}

/**
 * Get single tier information
 * Now uses subgraph instead of contract reads
 */
export async function getTierInfo(
  eventAddress: `0x${string}`,
  tierId: bigint
): Promise<TierData> {
  try {
    // Query by composite ID format: eventAddress-tierId
    const tierCompositeId = `${eventAddress.toLowerCase()}-${tierId.toString()}`

    const data = await querySubgraph<TiersQueryResponse>(GET_EVENT_TIERS, {
      eventAddress: eventAddress.toLowerCase(),
    })

    const tier = data.tiers.find((t) => t.tierId === tierId.toString())

    if (!tier) {
      throw new Error(`Tier ${tierId} not found for event ${eventAddress}`)
    }

    return subgraphTierToTierData(tier)
  } catch (error) {
    console.error('Error fetching tier info from subgraph:', error)
    throw error
  }
}

/**
 * Get all tickets owned by a user across all events
 * Now uses subgraph instead of fetching events + checking balances
 */
export async function getUserTickets(
  userAddress: `0x${string}`
): Promise<UserTicket[]> {
  try {
    const data = await querySubgraph<TicketBalancesQueryResponse>(
      GET_USER_TICKETS,
      {
        userAddress: userAddress.toLowerCase(),
      }
    )

    return data.ticketBalances.map((balance) => ({
      eventAddress: balance.event.id as `0x${string}`,
      eventName: balance.event.name,
      tierId: BigInt(balance.tier.tierId),
      tierName: balance.tier.tierName,
      balance: BigInt(balance.balance),
      price: BigInt(balance.tier.price),
    }))
  } catch (error) {
    console.error('Error fetching user tickets from subgraph:', error)
    return []
  }
}

/**
 * Search events by name
 * New function enabled by subgraph indexing
 */
export async function searchEvents(searchTerm: string): Promise<EventData[]> {
  try {
    const SEARCH_EVENTS = `
      query SearchEvents($searchTerm: String!) {
        events(
          where: { name_contains_nocase: $searchTerm }
          orderBy: createdAtTimestamp
          orderDirection: desc
          first: 100
        ) {
          id
          eventId
          name
          symbol
          creator
          accessPassNFT
          createdAtBlock
          createdAtTimestamp
          transactionHash
        }
      }
    `

    const data = await querySubgraph<EventsQueryResponse>(SEARCH_EVENTS, {
      searchTerm,
    })

    return data.events.map(subgraphEventToEventData)
  } catch (error) {
    console.error('Error searching events:', error)
    return []
  }
}

/**
 * Get events created by a specific creator
 * New function enabled by subgraph indexing
 */
export async function getEventsByCreator(
  creatorAddress: `0x${string}`
): Promise<EventData[]> {
  try {
    const GET_EVENTS_BY_CREATOR = `
      query GetEventsByCreator($creatorAddress: String!) {
        events(
          where: { creator: $creatorAddress }
          orderBy: createdAtTimestamp
          orderDirection: desc
        ) {
          id
          eventId
          name
          symbol
          creator
          accessPassNFT
          createdAtBlock
          createdAtTimestamp
          transactionHash
        }
      }
    `

    const data = await querySubgraph<EventsQueryResponse>(
      GET_EVENTS_BY_CREATOR,
      {
        creatorAddress: creatorAddress.toLowerCase(),
      }
    )

    return data.events.map(subgraphEventToEventData)
  } catch (error) {
    console.error('Error fetching events by creator:', error)
    return []
  }
}
