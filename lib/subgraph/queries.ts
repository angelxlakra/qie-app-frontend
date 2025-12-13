import { gql } from 'graphql-request'

/**
 * GraphQL queries for the Events subgraph
 * These queries replace direct contract reads with indexed data
 */

/**
 * Fragment for Event fields
 * Reusable across multiple queries
 */
export const EVENT_FIELDS = gql`
  fragment EventFields on Event {
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
`

/**
 * Fragment for Tier fields
 */
export const TIER_FIELDS = gql`
  fragment TierFields on Tier {
    id
    tierId
    tierName
    price
    maxSupply
    currentSupply
    active
    createdAtBlock
    createdAtTimestamp
  }
`

/**
 * Get all events
 * Ordered by creation time (newest first)
 */
export const GET_ALL_EVENTS = gql`
  query GetAllEvents($first: Int = 1000, $skip: Int = 0, $orderBy: String = "createdAtTimestamp", $orderDirection: String = "desc") {
    events(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
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

/**
 * Get a single event by address
 * Includes all tiers for that event
 */
export const GET_EVENT_BY_ADDRESS = gql`
  query GetEventByAddress($address: ID!) {
    event(id: $address) {
      id
      eventId
      name
      symbol
      creator
      accessPassNFT
      createdAtBlock
      createdAtTimestamp
      transactionHash
      tiers(orderBy: tierId, orderDirection: asc) {
        id
        tierId
        tierName
        price
        maxSupply
        currentSupply
        active
        createdAtBlock
        createdAtTimestamp
      }
    }
  }
`

/**
 * Get all tiers for a specific event
 */
export const GET_EVENT_TIERS = gql`
  query GetEventTiers($eventAddress: String!) {
    tiers(
      where: { event: $eventAddress }
      orderBy: tierId
      orderDirection: asc
    ) {
      id
      tierId
      tierName
      price
      maxSupply
      currentSupply
      active
      event {
        id
        name
      }
      createdAtBlock
      createdAtTimestamp
    }
  }
`

/**
 * Get a single tier by composite ID
 */
export const GET_TIER_BY_ID = gql`
  query GetTierById($id: ID!) {
    tier(id: $id) {
      id
      tierId
      tierName
      price
      maxSupply
      currentSupply
      active
      event {
        id
        name
      }
      createdAtBlock
      createdAtTimestamp
    }
  }
`

/**
 * Get all ticket balances for a user
 * Only returns balances > 0
 */
export const GET_USER_TICKETS = gql`
  query GetUserTickets($userAddress: String!) {
    ticketBalances(
      where: {
        user: $userAddress
        balance_gt: "0"
      }
      orderBy: balance
      orderDirection: desc
    ) {
      id
      balance
      event {
        id
        name
        symbol
      }
      tier {
        id
        tierId
        tierName
        price
      }
    }
  }
`

/**
 * Get user entity with all balances
 */
export const GET_USER_WITH_BALANCES = gql`
  query GetUserWithBalances($userAddress: ID!) {
    user(id: $userAddress) {
      id
      ticketBalances(
        where: { balance_gt: "0" }
        orderBy: balance
        orderDirection: desc
      ) {
        id
        balance
        event {
          id
          name
          symbol
        }
        tier {
          id
          tierId
          tierName
          price
        }
      }
    }
  }
`

/**
 * Get ticket balance for specific user + event + tier
 */
export const GET_USER_TIER_BALANCE = gql`
  query GetUserTierBalance($userAddress: String!, $eventAddress: String!, $tierId: String!) {
    ticketBalances(
      where: {
        user: $userAddress
        event: $eventAddress
        tier_: { tierId: $tierId }
      }
    ) {
      id
      balance
      event {
        id
        name
      }
      tier {
        id
        tierId
        tierName
        price
      }
    }
  }
`

/**
 * Get recent transfers (for activity feed, optional)
 */
export const GET_RECENT_TRANSFERS = gql`
  query GetRecentTransfers($first: Int = 50) {
    transfers(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from
      to
      tierId
      amount
      timestamp
      transactionHash
      event {
        id
        name
      }
    }
  }
`

/**
 * Search events by name (case-insensitive substring match)
 * Note: Subgraph text search varies by implementation
 */
export const SEARCH_EVENTS = gql`
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

/**
 * Get events by creator
 */
export const GET_EVENTS_BY_CREATOR = gql`
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
