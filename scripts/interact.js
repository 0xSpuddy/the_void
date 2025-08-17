const { ethers } = require("hardhat");

async function main() {
  // Configuration - Update these values
  const CONTRACT_ADDRESS = process.env.THE_VOID_CONTRACT_ADDR || "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  
  if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
    console.log("❌ Please set THE_VOID_CONTRACT_ADDR environment variable or update the script");
    console.log("Example: THE_VOID_CONTRACT_ADDR=0x123... npx hardhat run scripts/interact.js");
    process.exit(1);
  }

  console.log("🔗 Interacting with EchoToken at:", CONTRACT_ADDRESS);
  
  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  console.log("👑 Owner:", owner.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address);
  
  // Connect to the deployed contract
  const EchoToken = await ethers.getContractFactory("EchoToken");
  const echoToken = EchoToken.attach(CONTRACT_ADDRESS);
  
  console.log("\n📊 Current Token State:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Get current state
  const totalSupply = await echoToken.totalSupply();
  const ownerBalance = await echoToken.balanceOf(owner.address);
  const contractOwner = await echoToken.owner();
  const isPaused = await echoToken.paused();
  const remainingMintable = await echoToken.remainingMintableSupply();
  
  console.log("🔢 Total Supply:", ethers.formatEther(totalSupply), "ECHO");
  console.log("💰 Owner Balance:", ethers.formatEther(ownerBalance), "ECHO");
  console.log("👑 Contract Owner:", contractOwner);
  console.log("⏸️  Is Paused:", isPaused);
  console.log("🆕 Remaining Mintable:", ethers.formatEther(remainingMintable), "ECHO");
  
  console.log("\n🎬 Performing Interactions:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    // 1. Transfer tokens to user1
    console.log("\n1️⃣ Transferring 1000 ECHO to user1...");
    const transferAmount = ethers.parseEther("1000");
    const transferTx = await echoToken.transfer(user1.address, transferAmount);
    await transferTx.wait();
    
    const user1Balance = await echoToken.balanceOf(user1.address);
    console.log("✅ Transfer successful! User1 balance:", ethers.formatEther(user1Balance), "ECHO");
    
    // 2. Mint new tokens to user2
    console.log("\n2️⃣ Minting 500 ECHO to user2...");
    const mintAmount = ethers.parseEther("500");
    const mintTx = await echoToken.mint(user2.address, mintAmount);
    await mintTx.wait();
    
    const user2Balance = await echoToken.balanceOf(user2.address);
    console.log("✅ Mint successful! User2 balance:", ethers.formatEther(user2Balance), "ECHO");
    
    // 3. Add user1 as a minter
    console.log("\n3️⃣ Adding user1 as a minter...");
    const addMinterTx = await echoToken.addMinter(user1.address);
    await addMinterTx.wait();
    
    const isUser1Minter = await echoToken.isMinter(user1.address);
    console.log("✅ User1 is now a minter:", isUser1Minter);
    
    // 4. User1 mints tokens to themselves
    console.log("\n4️⃣ User1 minting 200 ECHO to themselves...");
    const user1MintAmount = ethers.parseEther("200");
    const user1MintTx = await echoToken.connect(user1).mint(user1.address, user1MintAmount);
    await user1MintTx.wait();
    
    const user1NewBalance = await echoToken.balanceOf(user1.address);
    console.log("✅ User1 mint successful! New balance:", ethers.formatEther(user1NewBalance), "ECHO");
    
    // 5. Batch mint to multiple users
    console.log("\n5️⃣ Batch minting to multiple addresses...");
    const recipients = [user1.address, user2.address];
    const amounts = [ethers.parseEther("100"), ethers.parseEther("150")];
    
    const batchMintTx = await echoToken.batchMint(recipients, amounts);
    await batchMintTx.wait();
    
    const user1FinalBalance = await echoToken.balanceOf(user1.address);
    const user2FinalBalance = await echoToken.balanceOf(user2.address);
    
    console.log("✅ Batch mint successful!");
    console.log("   User1 final balance:", ethers.formatEther(user1FinalBalance), "ECHO");
    console.log("   User2 final balance:", ethers.formatEther(user2FinalBalance), "ECHO");
    
    // 6. Burn tokens
    console.log("\n6️⃣ User1 burning 50 ECHO...");
    const burnAmount = ethers.parseEther("50");
    const burnTx = await echoToken.connect(user1).burn(burnAmount);
    await burnTx.wait();
    
    const user1BalanceAfterBurn = await echoToken.balanceOf(user1.address);
    console.log("✅ Burn successful! User1 balance after burn:", ethers.formatEther(user1BalanceAfterBurn), "ECHO");
    
    // 7. Test pause functionality
    console.log("\n7️⃣ Testing pause functionality...");
    
    // Pause the contract
    console.log("   Pausing contract...");
    const pauseTx = await echoToken.pause();
    await pauseTx.wait();
    console.log("✅ Contract paused");
    
    // Try to transfer (should fail)
    console.log("   Attempting transfer while paused (should fail)...");
    try {
      await echoToken.connect(user1).transfer(user2.address, ethers.parseEther("10"));
      console.log("❌ Transfer succeeded when it should have failed!");
    } catch (error) {
      console.log("✅ Transfer correctly failed while paused");
    }
    
    // Unpause the contract
    console.log("   Unpausing contract...");
    const unpauseTx = await echoToken.unpause();
    await unpauseTx.wait();
    console.log("✅ Contract unpaused");
    
    // Try transfer again (should succeed)
    console.log("   Attempting transfer after unpause...");
    const transferAfterUnpauseTx = await echoToken.connect(user1).transfer(user2.address, ethers.parseEther("10"));
    await transferAfterUnpauseTx.wait();
    console.log("✅ Transfer successful after unpause");
    
    // Final state
    console.log("\n📊 Final Token State:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const finalTotalSupply = await echoToken.totalSupply();
    const finalOwnerBalance = await echoToken.balanceOf(owner.address);
    const finalUser1Balance = await echoToken.balanceOf(user1.address);
    const finalUser2Balance = await echoToken.balanceOf(user2.address);
    const finalRemainingMintable = await echoToken.remainingMintableSupply();
    
    console.log("🔢 Final Total Supply:", ethers.formatEther(finalTotalSupply), "ECHO");
    console.log("💰 Owner Balance:", ethers.formatEther(finalOwnerBalance), "ECHO");
    console.log("👤 User1 Balance:", ethers.formatEther(finalUser1Balance), "ECHO");
    console.log("👤 User2 Balance:", ethers.formatEther(finalUser2Balance), "ECHO");
    console.log("🆕 Remaining Mintable:", ethers.formatEther(finalRemainingMintable), "ECHO");
    
    console.log("\n🎉 All interactions completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during interaction:");
    console.error(error.message);
  }
}

// Allow script to be called directly or imported
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
