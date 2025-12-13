import { createPublicClient, http, parseAbiItem } from 'viem'
import { qieTestnet } from '@/config/chains'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import EventFactoryABI from '@/abis/EventFactory.json'
import EventABI from '@/abis/Event.json'

export const publicClient = createPublicClient({
  chain: qieTestnet,
  transport: http(),
})

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

/**
 * Fetch all events created via EventFactory
 * QIE Testnet has a 10,000 block limit per request, so we fetch in chunks
 */
export async function getAllEvents(): Promise<EventData[]> {
  const eventCreatedAbi = parseAbiItem(
    'event EventCreated(address indexed eventAddress, address indexed creator, string name, uint256 indexed eventId)'
  )

  try {
    // Get current block number
    const latestBlock = await publicClient.getBlockNumber()

    // QIE Testnet deployment block - adjust this based on when EventFactory was deployed
    // For now, we'll fetch last 10,000 blocks (adjust as needed)
    const startBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n

    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESSES.eventFactory,
      event: eventCreatedAbi,
      fromBlock: startBlock,
      toBlock: 'latest',
    })

    return logs.map((log) => ({
      eventAddress: log.args.eventAddress!,
      creator: log.args.creator!,
      name: log.args.name!,
      eventId: log.args.eventId!,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    // Return empty array if fetching fails
    return []
  }
}

/**
 * Get basic event details (name, symbol, accessPassNFT address)
 */
export async function getEventDetails(
  eventAddress: `0x${string}`
): Promise<EventDetails> {
  const [name, symbol, accessPassNFT] = await Promise.all([
    publicClient.readContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'name',
    }),
    publicClient.readContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'accessPassNFT',
    }),
  ])

  return {
    address: eventAddress,
    name: name as string,
    symbol: symbol as string,
    accessPassNFT: accessPassNFT as `0x${string}`,
  }
}

/**
 * Get all tiers for an event
 */
export async function getEventTiers(
  eventAddress: `0x${string}`
): Promise<TierData[]> {
  const tierCreatedAbi = parseAbiItem(
    'event TierCreated(uint256 indexed tierId, string tierName, uint256 price, uint256 maxSupply)'
  )

  try {
    // Get current block number
    const latestBlock = await publicClient.getBlockNumber()
    const startBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n

    const logs = await publicClient.getLogs({
      address: eventAddress,
      event: tierCreatedAbi,
      fromBlock: startBlock,
      toBlock: 'latest',
    })

  // Fetch current tier state for each tier
  const tiers = await Promise.all(
    logs.map(async (log) => {
      const tierId = log.args.tierId!

      const [tierInfo, supply] = await Promise.all([
        publicClient.readContract({
          address: eventAddress,
          abi: EventABI,
          functionName: 'getTier',
          args: [tierId],
        }),
        publicClient.readContract({
          address: eventAddress,
          abi: EventABI,
          functionName: 'totalSupply',
          args: [tierId],
        }),
      ])

      const tier = tierInfo as {
        price: bigint
        maxSupply: bigint
        tierName: string
        active: boolean
      }

      return {
        tierId,
        tierName: tier.tierName,
        price: tier.price,
        maxSupply: tier.maxSupply,
        currentSupply: supply as bigint,
        available: tier.maxSupply - (supply as bigint),
        active: tier.active,
      }
    })
  )

    return tiers
  } catch (error) {
    console.error('Error fetching tiers:', error)
    return []
  }
}

/**
 * Get single tier information
 */
export async function getTierInfo(
  eventAddress: `0x${string}`,
  tierId: bigint
): Promise<TierData> {
  const [tierInfo, supply] = await Promise.all([
    publicClient.readContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'getTier',
      args: [tierId],
    }),
    publicClient.readContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'totalSupply',
      args: [tierId],
    }),
  ])

  const tier = tierInfo as {
    price: bigint
    maxSupply: bigint
    tierName: string
    active: boolean
  }

  return {
    tierId,
    tierName: tier.tierName,
    price: tier.price,
    maxSupply: tier.maxSupply,
    currentSupply: supply as bigint,
    available: tier.maxSupply - (supply as bigint),
    active: tier.active,
  }
}

/**
 * Get all tickets owned by a user across all events
 */
export async function getUserTickets(
  userAddress: `0x${string}`
): Promise<UserTicket[]> {
  try {
    // Get all events
    const events = await getAllEvents()

    // For each event, fetch tiers and check user balance
    const allTickets = await Promise.all(
      events.map(async (event) => {
        const tiers = await getEventTiers(event.eventAddress)

        // Check user balance for each tier
        const tickets = await Promise.all(
          tiers.map(async (tier) => {
            const balance = await publicClient.readContract({
              address: event.eventAddress,
              abi: EventABI,
              functionName: 'balanceOf',
              args: [userAddress, tier.tierId],
            })

            return {
              eventAddress: event.eventAddress,
              eventName: event.name,
              tierId: tier.tierId,
              tierName: tier.tierName,
              balance: balance as bigint,
              price: tier.price,
            }
          })
        )

        // Filter out tiers with zero balance
        return tickets.filter((ticket) => ticket.balance > 0n)
      })
    )

    // Flatten array and return
    return allTickets.flat()
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }
}
