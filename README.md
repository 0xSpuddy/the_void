***Note from the creator:***
***The code in this repo is spaghetti slop. Do not use!***
***It's just an idea that I had. I think it would be fun.***
***You should literally never run this code.***

# The Void

A dramatic Web3 application for shouting into The Void smart contract on Sepolia testnet.

## Features

- 🌑 Dramatic black void-themed UI
- 🔗 Web3 wallet connection via RainbowKit
- 💬 Shout messages permanently to the blockchain
- 🐍 Python/FastAPI backend serving React frontend
- ⚡ Real-time transaction status

## Quick Start

### 1. Install Python Dependencies

```bash
# Install with uv (recommended)
uv sync

# Or with pip
pip install -e .
```

### 2. Build the Frontend

```bash
python build_frontend.py
```

### 3. Run the Application

```bash
# Run with uvicorn directly
python -m the_void.main

# Or use uv run
uv run python -m the_void.main
```

The application will be available at **http://localhost:8000**

## How to Use

1. Open http://localhost:8000 in your browser
2. Click "Peek Into The Void" to start
3. Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
4. Make sure you're on **Sepolia testnet**
5. Enter your message in the text box
6. Click "SHOUT" to send your message to the void
7. Your message will be permanently stored on the blockchain

## Contract Details

- **Network**: Sepolia Testnet
- **Default Contract Address**: `0xCF6b75b6f2784BFBE2282010C638d0E9197cAbd7`
- **Chain ID**: 11155111

### Environment Configuration

Create a `.env` file in the project root to customize the contract address:

```bash
# Copy the example file
cp env.example .env

# Edit with your values
THE_VOID_CONTRACT_ADDR=0xYourContractAddressHere
CHAIN_ID=11155111
```

The application will automatically use the contract address from `THE_VOID_CONTRACT_ADDR` environment variable.

## Requirements

- Python 3.8+
- Node.js 16+ (for building frontend)
- Web3 wallet (MetaMask recommended)
- Sepolia testnet ETH for gas fees

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Development server on :5173
```

### Backend Development
```bash
# Run with auto-reload
python -m the_void.main
```

## Project Structure

```
the_void/
├── the_void/           # Python FastAPI backend
│   └── main.py        # Main FastAPI application
├── frontend/          # React frontend
│   ├── src/          # React source code
│   └── dist/         # Built frontend (created by build)
├── contracts/        # Smart contracts
├── scripts/          # Deployment scripts
└── build_frontend.py # Frontend build script
```

## Tech Stack

**Frontend:**
- React 18
- Vite
- Pure Wagmi (Web3 wallet connection)
- Wagmi (Ethereum interactions)
- Viem (Ethereum utilities)

**Backend:**
- FastAPI
- Uvicorn
- Python 3.8+

**Blockchain:**
- Ethereum Sepolia Testnet
- Solidity Smart Contracts
