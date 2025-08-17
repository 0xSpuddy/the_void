import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// Get RPC URL from environment variable
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL

if (!SEPOLIA_RPC_URL) {
  console.error('VITE_SEPOLIA_RPC_URL is not set in environment variables')
  throw new Error('VITE_SEPOLIA_RPC_URL environment variable is required')
}

// Wagmi configuration using Sepolia RPC from environment
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
})
