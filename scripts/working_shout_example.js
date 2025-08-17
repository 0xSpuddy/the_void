import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🎯 Working Shout Example");
  console.log("=" .repeat(40));

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}`);
  
  // Contract address
  const contractAddress = "0xC20C86437C8A9b0207706b8aDe98892Cf452f502";
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  const contract = TheVoidUnsafe.attach(contractAddress);
  
  console.log(`📡 Contract: ${contractAddress}`);
  console.log();

  // SOLUTION: Use the standardized query_data and query_id for all shouts
  const queryData = "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000116153684f7554694e744f744865566f496400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c57696c6c42654563686f65640000000000000000000000000000000000000000";
  
  const queryId = "0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89";
  
  // For your value, encode whatever string you want to shout
  const messageToShout = "Hello from The Void!";
  const value = ethers.AbiCoder.defaultAbiCoder().encode(["string"], [messageToShout]);
  
  const nonce = 0; // Start with 0, increment for subsequent shouts to same queryId

  console.log("📋 Shout Parameters:");
  console.log(`   Query ID: ${queryId}`);
  console.log(`   Message: "${messageToShout}"`);
  console.log(`   Nonce: ${nonce}`);
  console.log();

  try {
    console.log("🔊 Shouting...");
    
    // IMPORTANT: Use .shout() not .submitValue()
    const tx = await contract.shout(
      queryId,
      value,
      nonce,
      queryData,
      { gasLimit: 300000 }
    );
    
    console.log(`✅ Transaction sent: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`🎉 Success! Block: ${receipt.blockNumber}`);
    
    // Parse the NewShout event
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed.name === "NewShout") {
          console.log();
          console.log("📢 Shout Event:");
          console.log(`   Shouter: ${parsed.args._shouter}`);
          console.log(`   Query ID: ${parsed.args._queryId}`);
          console.log(`   Time: ${new Date(Number(parsed.args._time) * 1000).toLocaleString()}`);
          console.log(`   Nonce: ${parsed.args._nonce}`);
          
          // Decode the shouted message
          try {
            const decodedMessage = ethers.AbiCoder.defaultAbiCoder().decode(
              ["string"], 
              parsed.args._value
            )[0];
            console.log(`   Message: "${decodedMessage}"`);
          } catch {
            console.log(`   Raw Value: ${parsed.args._value}`);
          }
        }
      } catch {
        // Skip unparseable logs
      }
    }
    
  } catch (error) {
    console.error("❌ Shout failed:");
    console.error(`   ${error.message}`);
    
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
  }

  console.log();
  console.log("💡 Key Points:");
  console.log("   - Use contract.shout() NOT contract.submitValue()");
  console.log("   - Use the standardized queryData and queryId for all shouts");
  console.log("   - Encode your message as a string using ethers.AbiCoder");
  console.log("   - Increment nonce for subsequent shouts to the same queryId");
  console.log();
  console.log("🏁 Example completed");
}

main().catch(console.error);
