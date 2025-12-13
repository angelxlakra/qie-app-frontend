/**
 * TypeScript types for Subgraph entities
 * These match the GraphQL schema from the events subgraph
 */

/**
 * Event entity from subgraph
 * Represents a deployed Event contract
 */
export interface SubgraphEvent {
  id: string // Event contract address (lowercase)
  eventId: string // Event ID from EventFactory
  name: string
  symbol: string
  creator: string // Creator address (lowercase)
  accessPassNFT: string // AccessPassNFT address (lowercase)
  createdAtBlock: string
  createdAtTimestamp: string
  transactionHash: string
  tiers: SubgraphTier[] // Related tiers
}

/**
 * Tier entity from subgraph
 * Represents a ticket tier within an event
 */
export interface SubgraphTier {
  id: string // Format: eventAddress-tierId
  tierId: string
  tierName: string
  price: string // BigInt as string
  maxSupply: string // BigInt as string
  currentSupply: string // BigInt as string
  active: boolean
  event: {
    id: string
    name: string
  }
  createdAtBlock: string
  createdAtTimestamp: string
}

/**
 * User entity from subgraph
 * Represents a wallet that owns tickets
 */
export interface SubgraphUser {
  id: string // User address (lowercase)
  ticketBalances: SubgraphTicketBalance[]
}

/**
 * TicketBalance entity from subgraph
 * Represents a user's balance for a specific tier
 */
export interface SubgraphTicketBalance {
  id: string // Format: userAddress-eventAddress-tierId
  user: {
    id: string
  }
  event: {
    id: string
    name: string
  }
  tier: {
    id: string
    tierId: string
    tierName: string
    price: string
  }
  balance: string // BigInt as string
}

/**
 * Transfer entity from subgraph (optional, for tracking history)
 * Represents ERC1155 transfers
 */
export interface SubgraphTransfer {
  id: string // Transaction hash + log index
  from: string
  to: string
  event: {
    id: string
    name: string
  }
  tierId: string
  amount: string
  timestamp: string
  transactionHash: string
}

/**
 * Response types for GraphQL queries
 */
export interface EventsQueryResponse {
  events: SubgraphEvent[]
}

export interface EventQueryResponse {
  event: SubgraphEvent | null
}

export interface TiersQueryResponse {
  tiers: SubgraphTier[]
}

export interface UserQueryResponse {
  user: SubgraphUser | null
}

export interface TicketBalancesQueryResponse {
  ticketBalances: SubgraphTicketBalance[]
}
