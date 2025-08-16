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

  // Deploy the EchoToken contract
  console.log("🔨 Deploying EchoToken...");
  const EchoToken = await ethers.getContractFactory("EchoToken");
  
  // Deploy with name and symbol for EchoToken
  const echoToken = await EchoToken.deploy("Echo Token", "ECHO");
  
  // Wait for deployment to finish
  await echoToken.waitForDeployment();
  
  const echoTokenAddress = await echoToken.getAddress();
  console.log("✅ EchoToken deployed to:", echoTokenAddress);
  deployedContracts.EchoToken = echoTokenAddress;
  
  // Get deployment info for EchoToken
  const totalSupply = await echoToken.totalSupply();
  const decimals = await echoToken.decimals();
  const name = await echoToken.name();
  const symbol = await echoToken.symbol();
  
  console.log("\n📊 EchoToken Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏷️  Name:", name);
  console.log("🔤 Symbol:", symbol);
  console.log("🔢 Decimals:", decimals.toString());
  console.log("📦 Total Supply:", ethers.formatEther(totalSupply), "ECHO");

  // Deploy TheVoidUnsafe contract
  console.log("\n🔨 Deploying TheVoidUnsafe...");
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  
  // Deploy TheVoidUnsafe - it has its own token built-in
  const theVoidUnsafe = await TheVoidUnsafe.deploy();
  
  // Wait for deployment to finish
  await theVoidUnsafe.waitForDeployment();
  
  const voidAddress = await theVoidUnsafe.getAddress();
  console.log("✅ TheVoidUnsafe deployed to:", voidAddress);
  deployedContracts.TheVoidUnsafe = voidAddress;
  
  // Get TheVoidUnsafe info
  const voidTokenAddress = await theVoidUnsafe.token();
  const stakeAmount = await theVoidUnsafe.stakeAmount();
  
  console.log("\n📊 TheVoidUnsafe Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🪙 Token Address:", voidTokenAddress);
  console.log("🔒 Stake Amount:", ethers.formatEther(stakeAmount), "ECHO");
  
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
    echoToken: {
      name: name,
      symbol: symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.formatEther(totalSupply)
    },
    theVoidUnsafe: {
      tokenAddress: voidTokenAddress,
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
  
  // Verification instructions
  console.log("\n🔍 To verify the contracts, run:");
  console.log(`npx hardhat verify --network sepolia ${echoTokenAddress} "Echo Token" "ECHO"`);
  console.log(`npx hardhat verify --network sepolia ${voidAddress}`);
  
  return {
    deployedContracts,
    echoToken,
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
