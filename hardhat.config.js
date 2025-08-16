// Basic Hardhat configuration for ESM
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainId: 1337
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: (() => {
        if (!process.env.PRIVATE_KEY) {
          console.warn("⚠️  No PRIVATE_KEY found in .env file");
          return [];
        }
        
        // Remove 0x prefix if present and validate length
        const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
          ? process.env.PRIVATE_KEY.slice(2) 
          : process.env.PRIVATE_KEY;
          
        if (privateKey.length !== 64) {
          console.error(`❌ Invalid private key length: ${privateKey.length} characters. Expected 64 hex characters (32 bytes).`);
          return [];
        }
        
        return [`0x${privateKey}`];
      })(),
      chainId: 11155111,
      timeout: 60000,
      gasPrice: "auto"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
