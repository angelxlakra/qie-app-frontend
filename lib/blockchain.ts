import { formatEther, parseEther, type Address } from 'viem'

/**
 * Format Wei to Ether with custom decimal places
 */
export function formatWeiToEther(wei: bigint, decimals: number = 4): string {
  const eth = formatEther(wei)
  return Number(eth).toFixed(decimals)
}

/**
 * Parse Ether string to Wei
 */
export function parseEtherToWei(eth: string): bigint {
  return parseEther(eth)
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: Address | undefined, chars: number = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format large numbers with commas (e.g., 1,000,000)
 */
export function formatNumber(num: number | bigint): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Format price with currency symbol
 */
export function formatPrice(wei: bigint, symbol: string = 'QIE', decimals: number = 4): string {
  const eth = formatWeiToEther(wei, decimals)
  return `${eth} ${symbol}`
}

/**
 * Calculate percentage (used for royalties, discounts, etc.)
 */
export function calculatePercentage(part: bigint, total: bigint): number {
  if (total === 0n) return 0
  return Number((part * 10000n) / total) / 100
}

/**
 * Format basis points to percentage (e.g., 500 bps = 5%)
 */
export function formatBasisPoints(bps: number | bigint): string {
  const percentage = Number(bps) / 100
  return `${percentage}%`
}

/**
 * Convert Unix timestamp to Date object
 */
export function timestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) * 1000)
}

/**
 * Format Unix timestamp to readable string
 */
export function formatTimestamp(timestamp: bigint, locale: string = 'en-US'): string {
  const date = timestampToDate(timestamp)
  return date.toLocaleString(locale)
}

/**
 * Check if deadline has passed
 */
export function isExpired(deadline: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000))
  return deadline < now
}

/**
 * Get remaining time until deadline in seconds
 */
export function getRemainingTime(deadline: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000))
  const remaining = Number(deadline - now)
  return Math.max(0, remaining)
}

/**
 * Format countdown (e.g., "5:30" for 5 minutes 30 seconds)
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in human readable format
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

/**
 * Calculate gas cost in Ether
 */
export function calculateGasCost(gasUsed: bigint, gasPrice: bigint): bigint {
  return gasUsed * gasPrice
}

/**
 * Format gas cost for display
 */
export function formatGasCost(gasUsed: bigint, gasPrice: bigint, decimals: number = 6): string {
  const cost = calculateGasCost(gasUsed, gasPrice)
  return formatPrice(cost, 'QIE', decimals)
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 3)}...`
}

/**
 * Wait for specified milliseconds (useful for delays)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await sleep(delay)
      }
    }
  }

  throw lastError
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Get block explorer URL for transaction
 */
export function getBlockExplorerUrl(txHash: string, chainId: number = 1983): string {
  const explorers: Record<number, string> = {
    1983: 'https://testnet.qie.digital',
  }

  const baseUrl = explorers[chainId] || explorers[1983]
  return `${baseUrl}/tx/${txHash}`
}

/**
 * Get block explorer URL for address
 */
export function getAddressExplorerUrl(address: string, chainId: number = 1983): string {
  const explorers: Record<number, string> = {
    1983: 'https://testnet.qie.digital',
  }

  const baseUrl = explorers[chainId] || explorers[1983]
  return `${baseUrl}/address/${address}`
}

/**
 * Convert tier ID to display name (if not already named)
 */
export function getTierDisplayName(tierId: bigint, tierName?: string): string {
  if (tierName && tierName.trim() !== '') return tierName
  return `Tier ${tierId.toString()}`
}

/**
 * Calculate total supply percentage sold
 */
export function getSupplyPercentage(sold: bigint, total: bigint): number {
  if (total === 0n) return 0
  return Math.round(Number((sold * 100n) / total))
}

/**
 * Check if ticket tier is almost sold out (>90% sold)
 */
export function isAlmostSoldOut(available: bigint, maxSupply: bigint): boolean {
  if (maxSupply === 0n) return false
  const sold = maxSupply - available
  return getSupplyPercentage(sold, maxSupply) >= 90
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`

  return date.toLocaleDateString()
}

/**
 * Parse contract error message to user-friendly text
 */
export function parseContractError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'

  const errorMappings: Record<string, string> = {
    'User rejected': 'Transaction was rejected',
    'insufficient funds': 'Insufficient funds in wallet',
    'TierNotActive': 'This ticket tier is not available',
    'ExceedsMaxSupply': 'Not enough tickets available',
    'IncorrectPayment': 'Incorrect payment amount',
    'NotGatekeeper': 'Not authorized as gatekeeper',
    'SignatureExpired': 'QR code has expired',
    'InvalidSignature': 'Invalid QR code signature',
    'InsufficientTickets': 'You don\'t own enough tickets',
  }

  for (const [key, message] of Object.entries(errorMappings)) {
    if (errorMessage.includes(key)) {
      return message
    }
  }

  return 'Transaction failed. Please try again.'
}
