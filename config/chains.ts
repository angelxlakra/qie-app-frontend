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
      url: 'https://testnet.qie.digital',
    },
  },
  testnet: true,
})
