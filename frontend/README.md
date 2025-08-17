# The Void Frontend

A dramatic Web3 frontend for shouting into The Void smart contract on Sepolia testnet.

## Features

- 🌑 Dramatic black void-themed UI
- 🔗 Web3 wallet connection via Reown AppKit
- 💬 Text input for shouting messages
- 📡 Direct interaction with The Void smart contract
- ⚡ Real-time transaction status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## How to Use

1. Click "Peek Into The Void" to start
2. Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
3. Make sure you're on Sepolia testnet
4. Enter your message in the text box
5. Click "SHOUT" to send your message to the void
6. Your message will be permanently stored on the blockchain

## Contract Details

- **Network**: Sepolia Testnet
- **Contract Address**: `0xCF6b75b6f2784BFBE2282010C638d0E9197cAbd7`
- **Standard Query ID**: `0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89`

## Requirements

- Node.js 16+
- Web3 wallet (MetaMask recommended)
- Sepolia testnet ETH for gas fees

## Tech Stack

- React 18
- Vite
- Pure Wagmi (Web3 wallet connection)
- Wagmi (Ethereum interactions)
- Viem (Ethereum utilities)
