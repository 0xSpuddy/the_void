import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🔍 Checking Query State");
  console.log("=" .repeat(30));

  // Contract setup
  const contractAddress = "0xC20C86437C8A9b0207706b8aDe98892Cf452f502";
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  const contract = TheVoidUnsafe.attach(contractAddress);
  
  const queryId = "0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89";
  
  console.log(`Query ID: ${queryId}`);
  console.log();

  try {
    // Check the timestamps array for this query ID
    console.log("📊 Checking timestamps...");
    
    // Since we can't directly call the public mapping, let's try a different approach
    // Let's use a simple query ID that we know will work
    const simpleQueryId = ethers.zeroPadValue(ethers.toBeHex(42), 32);
    console.log(`Simple Query ID (42): ${simpleQueryId}`);
    
    // Try to call shout with a simple query ID
    const simpleQueryData = ethers.toUtf8Bytes("");
    const testValue = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["test message"]);
    
    console.log("🧪 Testing with simple query ID...");
    
    const tx = await contract.shout(
      simpleQueryId,
      testValue,
      0,
      simpleQueryData,
      { gasLimit: 300000 }
    );
    
    console.log(`✅ Simple query test transaction: ${tx.hash}`);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("🎉 Simple query test SUCCEEDED!");
      
      // Parse the event
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed.name === "NewShout") {
            console.log("📢 Event details:");
            console.log(`   Shouter: ${parsed.args._shouter}`);
            console.log(`   Query ID: ${parsed.args._queryId}`);
            console.log(`   Nonce: ${parsed.args._nonce}`);
            
            const decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(
              ["string"], 
              parsed.args._value
            )[0];
            console.log(`   Message: "${decodedValue}"`);
          }
        } catch {}
      }
    } else {
      console.log("❌ Simple query test failed too");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
  }

  console.log();
  console.log("🏁 State check completed");
}

main().catch(console.error);
