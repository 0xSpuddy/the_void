import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 EchoToken Contract Demo");
  console.log("=" .repeat(50));

  // Get signers
  const [owner, addr1, addr2] = await ethers.getSigners();
  console.log(`👤 Owner: ${owner.address}`);
  console.log(`👤 Addr1: ${addr1.address}`);
  console.log(`👤 Addr2: ${addr2.address}`);
  console.log();

  // Deploy contract
  console.log("📦 Deploying EchoToken contract...");
  const EchoToken = await ethers.getContractFactory("EchoToken");
  const echoToken = await EchoToken.deploy("DemoToken", "DEMO");
  await echoToken.waitForDeployment();
  
  const contractAddress = await echoToken.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddress}`);
  console.log();

  // Test basic info functions
  console.log("📋 Contract Information:");
  console.log(`   Name: ${await echoToken.name()}`);
  console.log(`   Symbol: ${await echoToken.symbol()}`);
  console.log(`   Decimals: ${await echoToken.decimals()}`);
  console.log(`   Total Supply: ${ethers.formatEther(await echoToken.totalSupply())} tokens`);
  console.log();

  // Test minting
  console.log("🏭 Testing Mint Function:");
  const mintAmount = ethers.parseEther("1000");
  console.log(`   Minting ${ethers.formatEther(mintAmount)} tokens to owner...`);
  const mintTx = await echoToken.mint(owner.address, mintAmount);
  await mintTx.wait();
  console.log(`   ✅ Minted! Owner balance: ${ethers.formatEther(await echoToken.balanceOf(owner.address))} tokens`);
  console.log(`   Total Supply: ${ethers.formatEther(await echoToken.totalSupply())} tokens`);
  console.log();

  // Test transfer
  console.log("💸 Testing Transfer Function:");
  const transferAmount = ethers.parseEther("250");
  console.log(`   Transferring ${ethers.formatEther(transferAmount)} tokens from owner to addr1...`);
  const transferTx = await echoToken.transfer(addr1.address, transferAmount);
  await transferTx.wait();
  console.log(`   ✅ Transferred! Addr1 balance: ${ethers.formatEther(await echoToken.balanceOf(addr1.address))} tokens`);
  console.log(`   Owner balance: ${ethers.formatEther(await echoToken.balanceOf(owner.address))} tokens`);
  console.log();

  // Test approve and transferFrom
  console.log("🔐 Testing Approve & TransferFrom Functions:");
  const approveAmount = ethers.parseEther("100");
  console.log(`   Addr1 approving ${ethers.formatEther(approveAmount)} tokens for addr2...`);
  const approveTx = await echoToken.connect(addr1).approve(addr2.address, approveAmount);
  await approveTx.wait();
  console.log(`   ✅ Approved! Allowance: ${ethers.formatEther(await echoToken.allowance(addr1.address, addr2.address))} tokens`);
  
  const transferFromAmount = ethers.parseEther("50");
  console.log(`   Addr2 transferring ${ethers.formatEther(transferFromAmount)} tokens from addr1 to owner...`);
  const transferFromTx = await echoToken.connect(addr2).transferFrom(addr1.address, owner.address, transferFromAmount);
  await transferFromTx.wait();
  console.log(`   ✅ TransferFrom completed!`);
  console.log(`   Addr1 balance: ${ethers.formatEther(await echoToken.balanceOf(addr1.address))} tokens`);
  console.log(`   Owner balance: ${ethers.formatEther(await echoToken.balanceOf(owner.address))} tokens`);
  console.log(`   Remaining allowance: ${ethers.formatEther(await echoToken.allowance(addr1.address, addr2.address))} tokens`);
  console.log();

  // Test burning
  console.log("🔥 Testing Burn Function:");
  const burnAmount = ethers.parseEther("100");
  console.log(`   Burning ${ethers.formatEther(burnAmount)} tokens from owner...`);
  const burnTx = await echoToken.burn(owner.address, burnAmount);
  await burnTx.wait();
  console.log(`   ✅ Burned! Owner balance: ${ethers.formatEther(await echoToken.balanceOf(owner.address))} tokens`);
  console.log(`   Total Supply: ${ethers.formatEther(await echoToken.totalSupply())} tokens`);
  console.log();

  // Final state
  console.log("📊 Final Contract State:");
  console.log(`   Total Supply: ${ethers.formatEther(await echoToken.totalSupply())} tokens`);
  console.log(`   Owner balance: ${ethers.formatEther(await echoToken.balanceOf(owner.address))} tokens`);
  console.log(`   Addr1 balance: ${ethers.formatEther(await echoToken.balanceOf(addr1.address))} tokens`);
  console.log(`   Addr2 balance: ${ethers.formatEther(await echoToken.balanceOf(addr2.address))} tokens`);
  console.log();

  // Error demonstration
  console.log("⚠️  Testing Error Conditions:");
  try {
    console.log("   Trying to transfer more tokens than balance...");
    await echoToken.connect(addr2).transfer(addr1.address, ethers.parseEther("1000"));
  } catch (error) {
    console.log(`   ❌ Expected error: Transaction reverted (insufficient balance)`);
  }

  try {
    console.log("   Trying to transferFrom without sufficient allowance...");
    await echoToken.connect(addr2).transferFrom(addr1.address, owner.address, ethers.parseEther("1000"));
  } catch (error) {
    console.log(`   ❌ Expected error: ${error.reason || "not approved"}`);
  }

  console.log();
  console.log("🎉 Demo completed successfully!");
  console.log("=" .repeat(50));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
