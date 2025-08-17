// Contract configuration for The Void
export const VOID_CONTRACT = {
  // Get contract address from environment variable or fallback to default
  address: import.meta.env.VITE_THE_VOID_CONTRACT_ADDR || '0xCF6b75b6f2784BFBE2282010C638d0E9197cAbd7',
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID) || 11155111, // Sepolia
  
  // Standard query data and query ID for all shouts (from working examples)
  QUERY_DATA: '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000116153684f7554694e744f744865566f496400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c57696c6c42654563686f65640000000000000000000000000000000000000000',
  QUERY_ID: '0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89'
}

// Contract ABI - only including the functions we need
export const VOID_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_queryId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_value",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "_nonce",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_queryData",
        "type": "bytes"
      }
    ],
    "name": "shout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_queryId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "_value",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_nonce",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "_queryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_shouter",
        "type": "address"
      }
    ],
    "name": "NewShout",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "timestamps",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
