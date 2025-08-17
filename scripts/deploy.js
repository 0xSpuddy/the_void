import hre from "hardhat";
const { ethers } = hre;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting contract deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  const deployedContracts = {};

  // Deploy TheVoidUnsafe contract (unified token + oracle)
  console.log("🔨 Deploying TheVoidUnsafe (unified token + oracle contract)...");
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  
  // Deploy TheVoidUnsafe - it has its own token built-in
  const theVoidUnsafe = await TheVoidUnsafe.deploy();
  
  // Wait for deployment to finish
  await theVoidUnsafe.waitForDeployment();
  
  const voidAddress = await theVoidUnsafe.getAddress();
  console.log("✅ TheVoidUnsafe deployed to:", voidAddress);
  deployedContracts.TheVoidUnsafe = voidAddress;
  
  // Get TheVoidUnsafe token info (it's also an ERC20 token)
  const voidTokenAddress = await theVoidUnsafe.token();
  const stakeAmount = await theVoidUnsafe.stakeAmount();
  const name = await theVoidUnsafe.name();
  const symbol = await theVoidUnsafe.symbol();
  const decimals = await theVoidUnsafe.decimals();
  const totalSupply = await theVoidUnsafe.totalSupply();
  
  console.log("\n📊 TheVoidUnsafe (Token + Oracle) Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏷️  Token Name:", name);
  console.log("🔤 Token Symbol:", symbol);
  console.log("🔢 Decimals:", decimals.toString());
  console.log("📦 Total Supply:", ethers.formatEther(totalSupply), symbol);
  console.log("🪙 Token Address:", voidTokenAddress);
  console.log("🔒 Stake Amount:", ethers.formatEther(stakeAmount), symbol);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Save deployment info to file
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contracts: deployedContracts,
    deployer: deployer.address,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    theVoidUnsafe: {
      address: voidAddress,
      tokenAddress: voidTokenAddress,
      tokenName: name,
      tokenSymbol: symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.formatEther(totalSupply),
      stakeAmount: ethers.formatEther(stakeAmount)
    }
  };
  
  // Write to deployment file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const networkName = network.name === 'unknown' ? `chainId-${network.chainId}` : network.name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Deployment info saved to:", deploymentFile);
  
  // Update .env file with new contract address
  const envPath = path.join(__dirname, '..', '.env');
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add THE_VOID_CONTRACT_ADDR
    const contractAddrRegex = /^THE_VOID_CONTRACT_ADDR=.*$/m;
    const newContractLine = `THE_VOID_CONTRACT_ADDR=${voidAddress}`;
    
    if (contractAddrRegex.test(envContent)) {
      envContent = envContent.replace(contractAddrRegex, newContractLine);
    } else {
      envContent += envContent.endsWith('\n') ? '' : '\n';
      envContent += `${newContractLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("🔄 Updated .env file with new contract address");
  } catch (error) {
    console.log("⚠️  Could not update .env file:", error.message);
    console.log("💡 Please manually add to .env file:");
    console.log(`THE_VOID_CONTRACT_ADDR=${voidAddress}`);
  }
  
  // Verification instructions
  console.log("\n🔍 To verify the contract, run:");
  console.log(`npx hardhat verify --network sepolia ${voidAddress}`);
  
  // Usage instructions
  console.log("\n💡 Usage Instructions:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🪙 Token Functions:");
  console.log(`   • faucet(address) - Mint 1000 ${symbol} tokens for testing`);
  console.log(`   • transfer(to, amount) - Transfer ${symbol} tokens`);
  console.log(`   • balanceOf(address) - Check ${symbol} balance`);
  console.log("🔊 Oracle Functions:");
  console.log("   • shout(queryId, value, nonce, queryData) - Submit data");
  console.log("   • retrieveData(queryId, timestamp) - Get submitted data");
  console.log("   • getDataBefore(queryId, timestamp) - Get latest data before timestamp");
  console.log("🔒 Staking Functions:");
  console.log("   • depositStake(amount) - Stake tokens");
  console.log("   • requestStakingWithdraw(amount) - Request withdrawal");
  console.log("   • withdrawStake() - Withdraw after 7 days");
  
  return {
    deployedContracts,
    theVoidUnsafe,
    deploymentInfo
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

export default main;
