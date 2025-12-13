# QIE Event Ticketing - Main App

A blockchain-based event ticketing system built on the QIE Testnet. This is the main app for event discovery, ticket purchasing, marketplace trading, and ticket management.

## Features

- 🎫 **Event Discovery** - Browse and search for upcoming events
- 💳 **Ticket Purchase** - Buy tickets directly from event organizers
- 🏪 **Secondary Marketplace** - Buy and sell tickets with royalties
- 📱 **Ticket Portfolio** - View all your tickets in one place
- 🔐 **QR Code Generation** - Generate secure QR codes for venue entry
- 🎨 **Event Creation** - Organizers can create events with multiple tiers

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **viem 2.x** - TypeScript interface for Ethereum
- **wagmi 2.x** - React Hooks for Ethereum
- **RainbowKit 2.x** - Wallet connection UI
- **TanStack Query** - Server state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, Rainbow, etc.)
- QIE testnet tokens for transactions

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd qie-app-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Get a WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com) and add it to `.env`:
\`\`\`
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Adding QIE Testnet to Your Wallet

Add the QIE Testnet network to your wallet with these details:

- **Network Name:** QIE Testnet
- **Chain ID:** 1983
- **RPC URL:** https://rpc1testnet.qie.digital
- **Currency Symbol:** QIE
- **Block Explorer:** https://testnet.qie.digital

## Smart Contract Addresses

- **EventFactory:** `0x8C4556d5d06A7A5C41FbC8C24A8c570E118840DA`
- **Marketplace:** `0xA24B34DfAC1a042A94c4A5F4a017C5606043d958`
- **Event Implementation:** `0x655E906affC5288136F61DFFB162769bB4147019`
- **AccessPassNFT Implementation:** `0xa622c84a62Bd355E9452741f38a1379b0703D91C`
- **Multicall3:** `0xAF564Fe5Ca1FB783dE2d898761bb9f21F682da35`

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
├── components/             # React components
├── config/                 # Blockchain configuration
│   ├── chains.ts          # QIE Testnet definition
│   ├── contracts.ts       # Contract addresses
│   └── wagmi.ts           # Wagmi + RainbowKit config
├── abis/                  # Contract ABIs
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── public/                # Static assets
\`\`\`

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Key Documentation

- [CLAUDE.md](./CLAUDE.md) - Architecture guide and development patterns
- [PROGRESS.md](./PROGRESS.md) - Complete task breakdown and roadmap
- [TASKS.md](./TASKS.md) - Daily task board
- [docs/main-app-integration.md](./docs/main-app-integration.md) - Smart contract integration guide

## Architecture

This app uses Next.js App Router with a mix of Server and Client Components:

- **Server Components** (default) - Used for data fetching and static content
- **Client Components** (`'use client'`) - Used for wallet connections and transactions

### Key Patterns

1. **Event Discovery** - Fetch events via blockchain logs on the server
2. **Ticket Purchase** - Client-side transactions with wagmi hooks
3. **QR Code Generation** - EIP-712 signatures for secure, offline-capable redemption
4. **Marketplace** - Two-step approval + listing pattern

## Contributing

See [PROGRESS.md](./PROGRESS.md) for the complete development roadmap and task list.

## License

MIT
