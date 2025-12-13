# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**This is the MAIN APP repository** for a blockchain-based event ticketing system built on the QIE Testnet. This app handles event discovery, ticket purchasing, marketplace trading, and user ticket portfolio management.

**Note:** The QR code scanner app (used by gatekeepers at venues) is a separate repository. This repository focuses on the attendee/organizer experience.

**Main App Responsibilities:**
- Event browsing and discovery
- Ticket purchasing (primary sales)
- Marketplace (secondary sales - buy/sell tickets)
- User ticket portfolio (view owned tickets)
- QR code generation (users generate QR codes from their tickets to show at venue)
- Event creation (for organizers)

**System Architecture Overview:**
- **EventFactory**: Deploys new Event contracts for organizers
- **Event Contract**: ERC-1155 for tiered tickets (VIP, General, etc.)
- **Marketplace**: Secondary market for ticket resale with royalties
- **AccessPassNFT**: ERC-721 tokens minted upon ticket redemption (at venue)
- **QR Code Redemption**: EIP-712 signed messages for secure, offline-capable ticket validation

## Technology Stack

### Blockchain Interaction (Required)
- **viem** (`^2.x`): TypeScript interface for Ethereum - used for all blockchain writes
- **wagmi** (`^2.x`): React Hooks for Ethereum - wallet connection, contract interactions
- **RainbowKit** (`^2.x`): Wallet connection UI with custom chain support

### Data Fetching (Subgraph)
- **graphql** & **graphql-request**: GraphQL client for querying the subgraph indexer
- **Subgraph URL**: https://simplr-events-qie-contracts-production.up.railway.app/graphql
- All event data, tiers, and user tickets are fetched from the subgraph (not direct contract reads)
- Contract reads are only used for real-time critical data (nonces, user balances during transactions)

### Frontend Framework (Recommended)
- **Next.js 15+** with App Router (Server Components + Client Components)
- **React 19** for UI components
- **TypeScript** for type safety

### QR Code Generation (Main App Feature)
- **qrcode** or **react-qr-code** for generating redemption QR codes that users show at venues
- User wallet signs EIP-712 message → generates QR code → displays in app
- **Note:** QR code scanning/redemption is handled in a separate scanner app repository

## Network Configuration

### QIE Testnet Details
```
Chain ID: 1983
RPC URL: https://rpc1testnet.qie.digital
Block Explorer: https://testnet.qie.digital/
Native Currency: QIE (18 decimals)
```

### Contract Addresses
```
EventFactory: 0x0efc2cc2a4ccd3F897076f7526951914362e1e5F
Marketplace: 0x5715D2CF651DF22032CfCF041bc90a9AA68Dd03f
Event Implementation: 0xa6Dc66Fce6147E78abb50F3a9Ed6A14069a0c7D1
```

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install viem wagmi @rainbow-me/rainbowkit @tanstack/react-query

# For GraphQL/Subgraph queries
npm install graphql graphql-request

# For QR code functionality
npm install qrcode html5-qrcode

# For Next.js projects
npx create-next-app@latest --typescript --tailwind --app
```

### Testing Commands
```bash
# Run tests (if using Vitest - recommended for Viem projects)
npm run test

# Run tests in watch mode
npm run test:watch

# Type checking
npx tsc --noEmit
```

### Development Server
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Patterns

### Chain Configuration (Viem)

Always define the QIE Testnet chain using `defineChain` from viem:

```typescript
// src/config/chains.ts
import { defineChain } from 'viem'

export const qieTestnet = defineChain({
  id: 1983,
  name: 'QIE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIE',
    symbol: 'QIE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc1testnet.qie.digital'],
    },
  },
  blockExplorers: {
    default: {
      name: 'QIE Explorer',
      url: 'https://testnet.qie.digital'
    },
  },
})
```

### Wagmi Configuration (Latest Pattern)

Use `createConfig` with RainbowKit connectors:

```typescript
// src/config/wagmi.ts
import { createConfig, http } from 'wagmi'
import { qieTestnet } from './chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, metaMaskWallet, coinbaseWallet],
    },
    {
      groupName: 'Other',
      wallets: [walletConnectWallet],
    },
  ],
  {
    appName: 'Event Ticketing',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from cloud.walletconnect.com
  }
)

export const config = createConfig({
  connectors,
  chains: [qieTestnet],
  transports: {
    [qieTestnet.id]: http(),
  },
})
```

### App Structure (Next.js App Router)

**Server Components (Default):**
- Use for data fetching from blockchain (read operations)
- Event listings, ticket availability, marketplace browsing
- No wallet connection needed

**Client Components (with 'use client'):**
- Wallet connection buttons
- Transaction signing (buy tickets, create listings)
- QR code generation (for ticket holders to show at venue)
- User ticket portfolio with interactive features
- All wagmi hooks (useAccount, useConnect, useWriteContract)

```typescript
// app/events/page.tsx (Server Component)
import { createPublicClient, http } from 'viem'
import { qieTestnet } from '@/config/chains'
import { EventList } from '@/components/EventList'

export default async function EventsPage() {
  const publicClient = createPublicClient({
    chain: qieTestnet,
    transport: http(),
  })

  // Fetch events on server
  const events = await fetchEventsFromChain(publicClient)

  return <EventList events={events} />
}

// components/BuyTicketButton.tsx (Client Component)
'use client'
import { useWriteContract } from 'wagmi'
import { EventABI } from '@/abis'

export function BuyTicketButton({ eventAddress, tierId, price }) {
  const { writeContract } = useWriteContract()

  const handleBuy = () => {
    writeContract({
      address: eventAddress,
      abi: EventABI,
      functionName: 'buyTickets',
      args: [tierId, 1n],
      value: price,
    })
  }

  return <button onClick={handleBuy}>Buy Ticket</button>
}
```

## Critical Implementation Patterns

### 1. Event Discovery Pattern (Subgraph-based)

**Use Subgraph for All Data Fetching:**
```typescript
import { querySubgraph } from '@/config/subgraph'
import { GET_ALL_EVENTS } from '@/lib/subgraph/queries'
import type { EventsQueryResponse } from '@/lib/subgraph/types'

// Fetch all events from subgraph
const data = await querySubgraph<EventsQueryResponse>(GET_ALL_EVENTS, {
  first: 1000,
  skip: 0,
  orderBy: 'createdAtTimestamp',
  orderDirection: 'desc',
})

const events = data.events.map(event => ({
  eventAddress: event.id as `0x${string}`,
  creator: event.creator as `0x${string}`,
  name: event.name,
  eventId: BigInt(event.eventId),
  blockNumber: BigInt(event.createdAtBlock),
  transactionHash: event.transactionHash as `0x${string}`,
}))
```

**Best Practice**: All event data, tiers, and user tickets are now fetched from the subgraph indexer. This is faster and more efficient than parsing logs or reading contracts directly. Contract reads are only used for:
- Real-time user balances during transactions
- Nonces for QR code generation (security-critical)
- Transaction writes (buying tickets, creating events, etc.)

### 2. QR Code Generation for Ticket Redemption (Main App Feature)

**Critical Pattern - Users generate QR codes to show at venue:**

```typescript
// User wallet generates signed message
const REDEMPTION_TYPES = {
  RedeemTicket: [
    { name: 'ticketHolder', type: 'address' },
    { name: 'tierId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const

const signature = await walletClient.signTypedData({
  account: ticketHolder,
  domain: {
    name: 'EventTicket',
    version: '1',
    chainId: 1983,
    verifyingContract: eventAddress,
  },
  types: REDEMPTION_TYPES,
  primaryType: 'RedeemTicket',
  message: {
    ticketHolder,
    tierId,
    nonce, // Get from contract: nonces(ticketHolder)
    deadline: BigInt(Math.floor(Date.now() / 1000) + 300), // 5 min expiry
  },
})
```

**QR Code Format:**
```typescript
interface QRCodeData {
  e: string  // eventAddress
  h: string  // ticketHolder
  t: string  // tierId (as string for JSON)
  d: string  // deadline (as string)
  s: string  // signature
}

const qrString = JSON.stringify({
  e: eventAddress,
  h: ticketHolder,
  t: tierId.toString(),
  d: deadline.toString(),
  s: signature,
})
```

### 3. Marketplace Integration

**Two-Step Pattern (Approval + Listing):**
```typescript
// Step 1: Approve marketplace to transfer tickets
const { writeContract } = useWriteContract()

await writeContract({
  address: eventAddress,
  abi: EventABI,
  functionName: 'setApprovalForAll',
  args: [MARKETPLACE_ADDRESS, true],
})

// Step 2: Create listing
await writeContract({
  address: MARKETPLACE_ADDRESS,
  abi: MarketplaceABI,
  functionName: 'createListing',
  args: [eventAddress, tierId, quantity, pricePerUnit, expirationTime],
})
```

**Note**: Always check approval status before attempting to list to avoid unnecessary transactions.

### 4. User Ticket Portfolio Pattern

**Display tickets owned by connected wallet:**
```typescript
'use client'
import { useAccount, useReadContract } from 'wagmi'
import { EventABI } from '@/abis'

export function UserTickets({ eventAddress }) {
  const { address } = useAccount()

  // Get user's balance for a specific tier
  const { data: balance } = useReadContract({
    address: eventAddress,
    abi: EventABI,
    functionName: 'balanceOf',
    args: [address, tierId], // tierId from tier list
  })

  return (
    <div>
      <p>You own {balance?.toString()} tickets</p>
      {balance > 0n && (
        <QRCodeGenerator
          eventAddress={eventAddress}
          tierId={tierId}
        />
      )}
    </div>
  )
}
```

### 5. Wallet Connection Pattern

```typescript
'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useConnectors } from 'wagmi'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()

  if (isConnected) {
    return (
      <div>
        <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
        >
          {connector.name}
        </button>
      ))}
    </div>
  )
}
```

## File Structure Recommendations (Main App)

```
src/
├── app/                      # Next.js App Router pages
│   ├── events/
│   │   ├── page.tsx         # Server Component: Event listing/discovery
│   │   └── [id]/
│   │       └── page.tsx     # Server Component: Event details + buy tickets
│   ├── marketplace/
│   │   └── page.tsx         # Server Component: Browse marketplace listings
│   ├── my-tickets/
│   │   └── page.tsx         # Client Component: User's tickets + QR generation
│   ├── create-event/
│   │   └── page.tsx         # Client Component: Event creation (organizers)
│   └── my-listings/
│       └── page.tsx         # Client Component: User's marketplace listings
├── components/
│   ├── WalletButton.tsx     # Client Component: Wallet connection
│   ├── BuyTicketButton.tsx  # Client Component: Purchase tickets
│   ├── CreateListingButton.tsx  # Client Component: Sell tickets
│   ├── QRCodeDisplay.tsx    # Client Component: Generate & show QR code
│   ├── EventCard.tsx        # Can be Server Component: Display event info
│   └── TicketCard.tsx       # Client Component: Display ticket with actions
├── config/
│   ├── chains.ts            # QIE Testnet chain definition
│   ├── contracts.ts         # Contract addresses (Factory, Marketplace)
│   ├── subgraph.ts          # GraphQL client configuration for subgraph
│   └── wagmi.ts             # Wagmi + RainbowKit configuration
├── abis/
│   ├── EventFactory.json    # For creating events
│   ├── Event.json           # For buying tickets
│   ├── Marketplace.json     # For listing/buying on marketplace
│   └── AccessPassNFT.json   # For viewing redeemed passes
├── hooks/
│   ├── useEventDetails.ts   # Fetch event information (from subgraph)
│   ├── useUserTickets.ts    # Fetch user's ticket balances (from subgraph)
│   ├── useMarketplace.ts    # Fetch marketplace listings
│   └── useQRCode.ts         # Generate EIP-712 signed QR codes
└── lib/
    ├── events.ts           # Data fetching functions (uses subgraph)
    ├── blockchain.ts        # Helper functions for blockchain interactions
    ├── qr.ts               # QR code generation utilities (EIP-712 signing)
    └── subgraph/
        ├── types.ts        # TypeScript types for subgraph entities
        └── queries.ts      # GraphQL queries for events, tiers, users
```

## Common Gotchas

### 1. BigInt Serialization
BigInt cannot be serialized to JSON directly. Convert to strings when passing to Client Components:

```typescript
// ❌ Bad
<BuyButton price={1000000000000000000n} />

// ✅ Good
<BuyButton price={1000000000000000000n.toString()} />
```

### 2. RainbowKit Initial Chain
Always set `initialChain` to prevent wrong network connections:

```typescript
<RainbowKitProvider initialChain={qieTestnet}>
  {children}
</RainbowKitProvider>
```

### 3. Nonce Management for Redemption
Always fetch the current nonce from the contract before generating QR codes. Using an outdated nonce will cause redemption to fail.

### 4. Gas Estimation Failures
When transactions fail with gas estimation errors, it usually means the transaction will revert. Common causes:
- Insufficient ticket balance
- Incorrect payment amount
- Tier not active
- Signature expired

Always validate conditions before attempting the transaction.

### 5. Subgraph Data Fetching
This application uses a GraphQL subgraph indexer for all data reads:
- **Subgraph URL**: https://simplr-events-qie-contracts-production.up.railway.app/graphql
- All events, tiers, and user tickets are fetched from the subgraph
- No direct contract reads for data fetching (only for writes and critical real-time data)
- TanStack Query is used for client-side caching with appropriate staleTime

## Testing Patterns

### Test Wallet Configuration
```typescript
// Use test accounts for local development
import { privateKeyToAccount } from 'viem/accounts'

const testAccount = privateKeyToAccount('0x...')
```

### Contract Interaction Testing
```typescript
// Use simulateContract before writeContract to catch errors
const { request } = await publicClient.simulateContract({
  address: eventAddress,
  abi: EventABI,
  functionName: 'buyTickets',
  args: [tierId, quantity],
  value: totalPrice,
  account: userAddress,
})

// If simulation succeeds, proceed with actual transaction
await walletClient.writeContract(request)
```

## Error Handling

### Custom Contract Errors
The contracts use custom errors. Parse them properly:

```typescript
try {
  await writeContract({...})
} catch (error: any) {
  if (error.message?.includes('TierNotActive')) {
    alert('This ticket tier is not currently available')
  } else if (error.message?.includes('ExceedsMaxSupply')) {
    alert('Not enough tickets available')
  } else if (error.message?.includes('IncorrectPayment')) {
    alert('Please send the exact payment amount')
  } else {
    // Log full error for debugging
    console.error('Transaction failed:', error)
    alert('Transaction failed. Please try again.')
  }
}
```

## Security Considerations

1. **Never expose private keys**: Use wallet connections only, never hardcode private keys
2. **Validate ticket ownership**: Before generating QR codes, verify the user owns tickets
3. **Short QR expiry**: Keep deadline at 5-10 minutes to prevent QR code reuse if photographed
4. **Check contract addresses**: Always verify you're interacting with the correct contract addresses
5. **Input validation**: Validate all user inputs before submitting transactions (quantities, prices, addresses)

## Performance Optimization

1. **Use Subgraph for all reads**: All event data, tiers, and user tickets are fetched from the GraphQL subgraph indexer (faster than RPC calls)
2. **Use Server Components for reads**: Fetch static data (events, tiers) on the server using subgraph queries
3. **Cache event data**: Use TanStack Query with appropriate staleTime (e.g., 1 minute for event listings)
4. **Contract reads only when necessary**: Only use direct contract reads for real-time critical data (nonces, transaction-time balances)
5. **Lazy load ABIs**: Import ABIs only where needed to reduce bundle size
6. **Optimize images**: Use Next.js Image component for event posters/thumbnails

## Documentation Reference

For implementation details, refer to:
- `docs/general-overview.md` - System architecture and smart contracts overview
- `docs/main-app-integration.md` - **Main app implementation guide (THIS REPOSITORY)**
- `docs/qr-scanner-app-integration.md` - Scanner app reference (separate repository, for context only)

## Key Differences from Typical dApps

1. **EIP-712 QR Codes**: Main app generates signed messages for QR codes (not typical transactions)
2. **Dual Token System**: ERC-1155 tickets (tradeable) + ERC-721 access passes (issued at venue)
3. **Custom Chain**: QIE Testnet (chain ID 1983) must be added to user wallets
4. **Two-App System**: Main app (this repo) for buying/selling, separate scanner app for redemption
5. **Nonces**: QR codes use nonces to prevent replay attacks (handled in QR generation logic)

## When Adding New Features (Main App)

1. **New contract interactions**: Add ABI to `/abis/` and import in relevant components
2. **New events to track**: Use `parseAbiItem` and `publicClient.getLogs` pattern
3. **New transaction types**: Follow the approval + action pattern for ERC-1155/ERC-721 operations
4. **New chains**: Add to `chains.ts` and update wagmi config transports
5. **QR code changes**: Update QR generation logic in main app (scanning logic is in separate scanner app)
6. **User flows**: Always consider both organizer flows (create events) and attendee flows (buy tickets, view portfolio)

## External Resources

- Viem Docs: https://viem.sh
- Wagmi Docs: https://wagmi.sh
- RainbowKit Docs: https://www.rainbowkit.com
- EIP-712: https://eips.ethereum.org/EIPS/eip-712
- Next.js App Router: https://nextjs.org/docs/app
