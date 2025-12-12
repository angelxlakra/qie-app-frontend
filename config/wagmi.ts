import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
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
    appName: 'qie-simplr-events',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'placeholder_for_development',
  }
)

export const config = createConfig({
  chains: [qieTestnet],
  connectors,
  transports: {
    [qieTestnet.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})
