# QIE Event Ticketing System - Frontend Architecture Plan

## Executive Summary

This plan outlines the architecture for building two frontend applications for a blockchain-based event ticketing system:

1. **Main App** - End-user application for event discovery, ticket purchasing, and marketplace trading
2. **QR Scanner App** - Gatekeeper application for venue ticket redemption

Both applications will interact with smart contracts deployed on QIE Testnet (Chain ID: 1983).

---

## 1. Technology Stack Recommendations

### Core Framework
| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Next.js 14+** | React framework | SSR for SEO, App Router, built-in routing, API routes for potential backend needs |
| **TypeScript** | Type safety | Documentation provides TS types, critical for blockchain data handling |
| **viem** | Blockchain SDK | Already specified in docs, modern type-safe Ethereum library |

### State Management & Data Fetching
| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **TanStack Query (React Query)** | Server state/caching | Ideal for blockchain reads, caching, optimistic updates |
| **Zustand** | Client state | Lightweight, handles wallet state, UI state |
| **wagmi** | React Hooks for Ethereum | Built on viem, provides wallet connection hooks |

### UI & Styling
| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Tailwind CSS** | Styling | Rapid development, consistency |
| **shadcn/ui** | Component library | Accessible, customizable, works with Tailwind |
| **Radix UI** | Primitives | Accessible headless components |
| **Framer Motion** | Animations | Smooth UX transitions |

### Additional Libraries
| Technology | Purpose |
|------------|---------|
| **qrcode** / **react-qr-code** | QR code generation (Main App) |
| **html5-qrcode** | QR code scanning (Scanner App) |
| **date-fns** | Date formatting |
| **zod** | Runtime validation |
| **react-hook-form** | Form handling |

---

## 2. Project Structure

### Monorepo Structure (Recommended)
```
qie-ticketing/
├── apps/
│   ├── main-app/              # Main user application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages
│   │   │   ├── components/    # App-specific components
│   │   │   ├── features/      # Feature modules
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── scanner-app/           # QR Scanner application
│       ├── src/
│       │   ├── app/           # Next.js App Router pages
│       │   ├── components/    # Scanner-specific components
│       │   └── ...
│       └── package.json
│
├── packages/
│   ├── blockchain/            # Shared blockchain logic
│   │   ├── src/
│   │   │   ├── config/        # Chain, contracts, clients
│   │   │   ├── abis/          # Contract ABIs (JSON)
│   │   │   ├── hooks/         # Shared React hooks
│   │   │   ├── services/      # Contract interaction services
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   │
│   └── ui/                    # Shared UI components
│       ├── src/
│       │   ├── components/    # Shared components
│       │   └── styles/        # Shared styles
│       └── package.json
│
├── turbo.json                 # Turborepo config
├── package.json               # Root package.json
└── pnpm-workspace.yaml        # pnpm workspace config
```

### Alternative: Separate Repositories
If monorepo adds complexity, create two separate repos sharing an npm package for blockchain logic.

---

## 3. Shared Blockchain Package Architecture

### 3.1 Configuration Layer (`packages/blockchain/src/config/`)

```
config/
├── chains.ts          # QIE Testnet chain definition
├── contracts.ts       # Contract addresses
├── clients.ts         # viem public/wallet clients
└── index.ts           # Exports
```

**Key Implementation Points:**
- Define `qieTestnet` chain using `defineChain()` from viem
- Export singleton `publicClient` for read operations
- Factory function `getWalletClient()` for wallet operations
- Support for multiple RPC endpoints (failover)

### 3.2 ABI Management (`packages/blockchain/src/abis/`)

```
abis/
├── EventFactory.json
├── Event.json
├── Marketplace.json
├── AccessPassNFT.json
├── SimplrErrors.json
└── index.ts           # Typed exports
```

**Note:** ABI files need to be obtained from the smart contract deployment. The documentation references these but they're not in the repo yet.

### 3.3 Type Definitions (`packages/blockchain/src/types/`)

```typescript
// types/event.ts
export interface EventConfig {
  name: string
  symbol: string
  baseURI: string
  royaltyBps: bigint
}

export interface TierConfig {
  tierId: bigint
  tierName: string
  price: bigint
  maxSupply: bigint
}

export interface Tier extends TierConfig {
  active: boolean
  currentSupply: bigint
  available: bigint
}

export interface EventDetails {
  address: `0x${string}`
  name: string
  symbol: string
  accessPassNFT: `0x${string}`
  creator: `0x${string}`
  eventId: bigint
  tiers: Tier[]
}

// types/marketplace.ts
export interface Listing {
  listingId: bigint
  seller: `0x${string}`
  eventContract: `0x${string}`
  tokenId: bigint
  quantity: bigint
  pricePerUnit: bigint
  expirationTime: bigint
  active: boolean
}

// types/access-pass.ts
export interface AccessPass {
  tokenId: bigint
  owner: `0x${string}`
  tierId: bigint
  mintTimestamp: bigint
  transferable: boolean
  transferUnlockTime: bigint
}

// types/redemption.ts
export interface QRCodeData {
  eventAddress: `0x${string}`
  ticketHolder: `0x${string}`
  tierId: bigint
  deadline: bigint
  signature: `0x${string}`
}
```

### 3.4 Service Layer (`packages/blockchain/src/services/`)

```
services/
├── event-factory.service.ts   # EventFactory interactions
├── event.service.ts           # Event contract interactions
├── marketplace.service.ts     # Marketplace interactions
├── access-pass.service.ts     # AccessPassNFT interactions
├── redemption.service.ts      # QR/signature logic
└── index.ts
```

**Service Pattern Example:**
```typescript
// services/event.service.ts
class EventService {
  // Read operations
  async getEventDetails(address: Address): Promise<EventDetails>
  async getTier(eventAddress: Address, tierId: bigint): Promise<Tier>
  async getAllTiers(eventAddress: Address): Promise<Tier[]>
  async getUserTicketBalance(eventAddress: Address, user: Address, tierId: bigint): Promise<bigint>
  async getUserAllTickets(eventAddress: Address, user: Address): Promise<UserTicket[]>

  // Write operations
  async buyTickets(eventAddress: Address, tierId: bigint, quantity: bigint): Promise<TxResult>

  // Event queries
  async watchTicketPurchases(eventAddress: Address, callback: (purchase) => void): Promise<UnwatchFn>
}
```

### 3.5 React Hooks (`packages/blockchain/src/hooks/`)

```
hooks/
├── use-events.ts              # Event discovery hooks
├── use-event-details.ts       # Single event data
├── use-tiers.ts               # Tier data hooks
├── use-user-tickets.ts        # User's ticket portfolio
├── use-marketplace.ts         # Marketplace hooks
├── use-access-passes.ts       # Access pass hooks
├── use-redemption.ts          # QR/redemption hooks
├── use-wallet.ts              # Wallet connection
└── index.ts
```

**Hook Pattern Example:**
```typescript
// hooks/use-event-details.ts
export function useEventDetails(eventAddress: Address) {
  return useQuery({
    queryKey: ['event', eventAddress],
    queryFn: () => eventService.getEventDetails(eventAddress),
    enabled: !!eventAddress,
    staleTime: 30_000, // 30 seconds
  })
}

export function useUserTickets(eventAddress: Address, userAddress: Address) {
  return useQuery({
    queryKey: ['tickets', eventAddress, userAddress],
    queryFn: () => eventService.getUserAllTickets(eventAddress, userAddress),
    enabled: !!eventAddress && !!userAddress,
  })
}
```

---

## 4. Main Application Architecture

### 4.1 Page Structure

```
app/
├── page.tsx                       # Home - Event discovery
├── events/
│   ├── page.tsx                   # Events listing
│   ├── [eventId]/
│   │   ├── page.tsx               # Event details + purchase
│   │   └── marketplace/
│   │       └── page.tsx           # Event's secondary market
│   └── create/
│       └── page.tsx               # Create new event (organizers)
├── marketplace/
│   └── page.tsx                   # Global marketplace
├── portfolio/
│   ├── page.tsx                   # User's tickets overview
│   ├── tickets/
│   │   └── page.tsx               # All tickets
│   ├── access-passes/
│   │   └── page.tsx               # All access passes
│   └── listings/
│       └── page.tsx               # User's marketplace listings
├── redeem/
│   └── [eventId]/
│       └── page.tsx               # QR code generation for redemption
└── layout.tsx                     # Root layout with wallet provider
```

### 4.2 Feature Modules

```
features/
├── wallet/
│   ├── components/
│   │   ├── ConnectButton.tsx
│   │   ├── WalletModal.tsx
│   │   └── NetworkSwitcher.tsx
│   ├── hooks/
│   │   └── use-wallet.ts
│   └── providers/
│       └── WalletProvider.tsx
│
├── events/
│   ├── components/
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── EventDetails.tsx
│   │   ├── TierCard.tsx
│   │   ├── TierList.tsx
│   │   └── PurchaseModal.tsx
│   ├── hooks/
│   │   └── use-events.ts
│   └── utils/
│       └── event-helpers.ts
│
├── event-creation/
│   ├── components/
│   │   ├── CreateEventForm.tsx
│   │   ├── TierConfigForm.tsx
│   │   ├── GatekeeperConfig.tsx
│   │   └── PreviewStep.tsx
│   ├── hooks/
│   │   └── use-create-event.ts
│   └── schemas/
│       └── event-schema.ts
│
├── marketplace/
│   ├── components/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── CreateListingModal.tsx
│   │   ├── BuyListingModal.tsx
│   │   └── ListingFilters.tsx
│   ├── hooks/
│   │   └── use-marketplace.ts
│   └── utils/
│       └── listing-helpers.ts
│
├── portfolio/
│   ├── components/
│   │   ├── TicketCard.tsx
│   │   ├── AccessPassCard.tsx
│   │   ├── MyListingCard.tsx
│   │   └── PortfolioSummary.tsx
│   └── hooks/
│       └── use-portfolio.ts
│
└── redemption/
    ├── components/
    │   ├── QRCodeGenerator.tsx
    │   ├── QRCodeDisplay.tsx
    │   ├── ExpiryCountdown.tsx
    │   └── SelectTicketTier.tsx
    ├── hooks/
    │   └── use-qr-generation.ts
    └── utils/
        └── qr-encoding.ts
```

### 4.3 Key User Flows

#### Flow 1: Event Discovery & Purchase
```
1. User lands on home page → Browse events (useAllEvents hook)
2. Click event card → Navigate to /events/[eventId]
3. View event details + tiers (useEventDetails, useTiers hooks)
4. Select tier + quantity → Open purchase modal
5. Confirm transaction → buyTickets() via wallet
6. Success → Redirect to portfolio
```

#### Flow 2: Marketplace Listing
```
1. User visits portfolio → See owned tickets
2. Click "Sell" on ticket → Open CreateListingModal
3. Set price + expiration + quantity
4. First: setApprovalForAll() for Marketplace
5. Then: createListing() transaction
6. Success → Listing visible in marketplace
```

#### Flow 3: QR Code Generation
```
1. User visits /redeem/[eventId]
2. Select ticket tier to redeem
3. Click "Generate QR"
4. Sign EIP-712 message (wallet popup)
5. QR code displayed with countdown timer
6. User shows QR to gatekeeper at venue
```

---

## 5. QR Scanner Application Architecture

### 5.1 Page Structure (Simplified)

```
app/
├── page.tsx                       # Scanner home - select event
├── scan/
│   └── [eventAddress]/
│       └── page.tsx               # Active scanning interface
├── history/
│   └── page.tsx                   # Redemption history
└── layout.tsx                     # Root layout
```

### 5.2 Feature Modules

```
features/
├── scanner/
│   ├── components/
│   │   ├── QRScanner.tsx          # Camera-based scanner
│   │   ├── ScanResult.tsx         # Success/error display
│   │   ├── ConfirmRedemption.tsx  # Pre-redemption confirmation
│   │   └── TicketInfo.tsx         # Scanned ticket details
│   ├── hooks/
│   │   ├── use-qr-scanner.ts
│   │   └── use-redemption.ts
│   └── utils/
│       └── qr-parsing.ts
│
├── gatekeeper/
│   ├── components/
│   │   ├── GatekeeperStatus.tsx   # Is current wallet a gatekeeper?
│   │   └── EventSelector.tsx      # Select event to scan for
│   └── hooks/
│       └── use-gatekeeper.ts
│
└── history/
    ├── components/
    │   ├── RedemptionLog.tsx
    │   └── RedemptionCard.tsx
    └── hooks/
        └── use-redemption-history.ts
```

### 5.3 Scanner Flow

```
1. Gatekeeper connects wallet
2. System checks if wallet is authorized gatekeeper
3. Select event to scan for
4. Camera activates → Scan QR codes
5. Parse QR → Validate (expiry, ownership)
6. Show confirmation screen with ticket details
7. Confirm → Execute redeemTicket() transaction
8. Display success (AccessPass ID) or error
9. Log to history → Ready for next scan
```

---

## 6. State Management Strategy

### 6.1 Global State (Zustand)

```typescript
// stores/wallet.store.ts
interface WalletState {
  address: `0x${string}` | null
  chainId: number | null
  isConnected: boolean
  isCorrectNetwork: boolean

  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
}

// stores/ui.store.ts
interface UIState {
  isPurchaseModalOpen: boolean
  isListingModalOpen: boolean
  selectedTier: bigint | null
  selectedListing: Listing | null

  // Actions
  openPurchaseModal: (tierId: bigint) => void
  closePurchaseModal: () => void
  // ...
}
```

### 6.2 Server State (TanStack Query)

All blockchain data fetching uses React Query:

```typescript
// Query key factory pattern
export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  byCreator: (creator: Address) => [...eventKeys.all, 'creator', creator] as const,
  detail: (address: Address) => [...eventKeys.all, 'detail', address] as const,
  tiers: (address: Address) => [...eventKeys.detail(address), 'tiers'] as const,
}

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  listings: (eventAddress?: Address) =>
    eventAddress
      ? [...marketplaceKeys.all, 'event', eventAddress]
      : [...marketplaceKeys.all, 'all'],
  bySeller: (seller: Address) => [...marketplaceKeys.all, 'seller', seller] as const,
}
```

### 6.3 Optimistic Updates

For marketplace operations, use optimistic updates:

```typescript
const createListingMutation = useMutation({
  mutationFn: (params) => marketplaceService.createListing(params),
  onMutate: async (newListing) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: marketplaceKeys.bySeller(address) })

    // Snapshot previous value
    const previousListings = queryClient.getQueryData(marketplaceKeys.bySeller(address))

    // Optimistically update
    queryClient.setQueryData(marketplaceKeys.bySeller(address), (old) => [
      ...old,
      { ...newListing, status: 'pending' }
    ])

    return { previousListings }
  },
  onError: (err, newListing, context) => {
    // Rollback on error
    queryClient.setQueryData(marketplaceKeys.bySeller(address), context.previousListings)
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: marketplaceKeys.bySeller(address) })
  },
})
```

---

## 7. Wallet Integration

### 7.1 Supported Wallets

Use wagmi's connectors:
- MetaMask (primary)
- WalletConnect v2
- Coinbase Wallet
- Injected (generic)

### 7.2 Wallet Provider Setup

```typescript
// providers/WalletProvider.tsx
import { WagmiConfig, createConfig, http } from 'wagmi'
import { qieTestnet } from '@/config/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  chains: [qieTestnet],
  transports: {
    [qieTestnet.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
    coinbaseWallet({ appName: 'QIE Ticketing' }),
  ],
})

export function WalletProvider({ children }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
}
```

### 7.3 Network Switching

Auto-prompt users to switch to QIE Testnet:

```typescript
function useNetworkCheck() {
  const { chainId, switchChain } = useNetwork()

  useEffect(() => {
    if (chainId && chainId !== qieTestnet.id) {
      switchChain({ chainId: qieTestnet.id })
    }
  }, [chainId])
}
```

---

## 8. Error Handling Strategy

### 8.1 Contract Error Mapping

```typescript
// utils/error-handler.ts
const CONTRACT_ERRORS: Record<string, string> = {
  // Event errors
  TierNotActive: 'This ticket tier is currently unavailable.',
  TierDoesNotExist: 'This ticket tier does not exist.',
  ExceedsMaxSupply: 'Not enough tickets available.',
  IncorrectPayment: 'Incorrect payment amount.',
  SignatureExpired: 'QR code has expired. Please generate a new one.',
  InvalidSignature: 'Invalid QR code. Please try again.',
  NotGatekeeper: 'You are not authorized to scan tickets.',
  InsufficientTickets: 'User does not own this ticket.',

  // Marketplace errors
  ListingDoesNotExist: 'This listing no longer exists.',
  ListingNotActive: 'This listing is no longer available.',
  ListingExpired: 'This listing has expired.',
  InsufficientQuantity: 'Not enough tickets in this listing.',
  NotSeller: 'Only the seller can modify this listing.',

  // AccessPass errors
  TransferLocked: 'Access pass cannot be transferred for 24 hours.',
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    for (const [key, message] of Object.entries(CONTRACT_ERRORS)) {
      if (error.message.includes(key)) {
        return message
      }
    }
    // User rejected
    if (error.message.includes('User rejected')) {
      return 'Transaction was cancelled.'
    }
  }
  return 'An unexpected error occurred. Please try again.'
}
```

### 8.2 Transaction Simulation

Before sending transactions, simulate them to catch errors early:

```typescript
async function simulateAndExecute<T>(
  simulateFn: () => Promise<{ request: T }>,
  executeFn: (request: T) => Promise<Hash>
): Promise<Hash> {
  // Simulate first
  const { request } = await simulateFn()

  // Execute if simulation succeeds
  return executeFn(request)
}
```

### 8.3 Toast Notifications

Use a toast system for user feedback:
- Success: Transaction confirmed
- Info: Transaction pending
- Error: Transaction failed with user-friendly message

---

## 9. Security Considerations

### 9.1 QR Code Security

| Concern | Mitigation |
|---------|------------|
| Replay attacks | Nonce-based signatures (auto-increments) |
| Stale QR codes | Short expiry (5-10 min recommended) |
| Photographed QR | Countdown timer, visual expiry warning |
| Private key exposure | Only signature encoded, never private key |

### 9.2 Wallet Security

| Concern | Mitigation |
|---------|------------|
| Wrong network | Auto-prompt network switch |
| Phishing | Display connected address clearly |
| Transaction manipulation | Show clear transaction preview |

### 9.3 Input Validation

- Validate all user inputs with Zod schemas
- Sanitize event/tier names before display
- Verify contract addresses against known list

---

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)

```
__tests__/
├── services/
│   ├── event.service.test.ts
│   ├── marketplace.service.test.ts
│   └── redemption.service.test.ts
├── hooks/
│   ├── use-events.test.ts
│   └── use-marketplace.test.ts
└── utils/
    ├── error-handler.test.ts
    └── qr-encoding.test.ts
```

### 10.2 Integration Tests (Playwright)

- Event discovery flow
- Ticket purchase flow
- Marketplace listing flow
- QR generation flow
- Scanner redemption flow

### 10.3 Contract Mocking

Use viem's `createTestClient` for local testing:

```typescript
import { createTestClient, http, publicActions, walletActions } from 'viem'
import { foundry } from 'viem/chains'

const testClient = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)
```

---

## 11. Performance Optimization

### 11.1 Data Fetching

- **Caching**: Use React Query's staleTime and cacheTime
- **Pagination**: Paginate event/listing queries
- **Event indexing**: Cache block numbers for efficient historical queries

### 11.2 Bundle Optimization

- Code split by route (Next.js automatic)
- Lazy load QR scanner component (camera access)
- Tree-shake viem (only import needed functions)

### 11.3 RPC Optimization

- Batch reads with `multicall`
- Use event logs instead of iterating contract state
- Consider adding backup RPC endpoints

---

## 12. Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
- [ ] Set up monorepo with Turborepo
- [ ] Create shared blockchain package
- [ ] Implement chain/client configuration
- [ ] Add ABI files and type definitions
- [ ] Build wallet connection flow
- [ ] Implement core service layer

### Phase 2: Main App - Read Operations
- [ ] Event discovery page
- [ ] Event details page with tiers
- [ ] User portfolio (tickets view)
- [ ] Access passes view

### Phase 3: Main App - Write Operations
- [ ] Ticket purchase flow
- [ ] Event creation flow
- [ ] Marketplace listing creation
- [ ] Marketplace purchase flow

### Phase 4: QR/Redemption Features
- [ ] QR code generation (Main App)
- [ ] QR scanner implementation (Scanner App)
- [ ] Redemption execution
- [ ] Gatekeeper verification

### Phase 5: Polish & Testing
- [ ] Error handling refinement
- [ ] Loading states & skeletons
- [ ] Transaction notifications
- [ ] Unit & integration tests
- [ ] Performance optimization

### Phase 6: Production Readiness
- [ ] Security audit
- [ ] Mainnet configuration
- [ ] Analytics integration
- [ ] Monitoring & logging

---

## 13. Required Assets (Not Yet in Repo)

Before development can begin, the following are needed:

1. **ABI Files**
   - EventFactory.json
   - Event.json
   - Marketplace.json
   - AccessPassNFT.json
   - SimplrErrors.json

2. **Design Assets**
   - UI/UX mockups or wireframes
   - Brand guidelines (colors, typography, logo)
   - Icon set

3. **Configuration**
   - WalletConnect Project ID
   - Metadata base URI structure
   - Any additional RPC endpoints

---

## 14. Key Decisions Required

1. **Monorepo vs. Separate Repos?**
   - Recommendation: Monorepo for code sharing efficiency

2. **PWA for Scanner App?**
   - Consider: Better mobile experience for gatekeepers

3. **Backend Requirements?**
   - Do we need: Event metadata storage? User profiles? Off-chain indexing?

4. **Mainnet Planning?**
   - What is the QIE Mainnet configuration?

---

This plan provides a complete roadmap for building both frontend applications. The architecture prioritizes type safety, code reuse between apps, and a solid foundation for blockchain interactions.
