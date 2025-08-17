import hre from "hardhat";
import dotenv from "dotenv";
const { ethers } = hre;

// Load environment variables
dotenv.config();

async function main() {
  console.log("🔊 Testing TheVoidUnsafe Shout with Proper Encoding");
  console.log("=" .repeat(50));

  // Get signers
  const [owner] = await ethers.getSigners();
  console.log(`👤 Signer: ${owner.address}`);
  
  // Connect to deployed contract using environment variable
  const contractAddress = process.env.THE_VOID_CONTRACT_ADDR || "0xCF6b75b6f2784BFBE2282010C638d0E9197cAbd7";
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  const voidContract = TheVoidUnsafe.attach(contractAddress);
  
  console.log(`📡 Connected to contract: ${contractAddress}`);
  console.log();

  // Use the standardized query_data and query_id for all shouts
  const queryData = "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000116153684f7554694e744f744865566f496400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c57696c6c42654563686f65640000000000000000000000000000000000000000";
  
  const queryId = "0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89";
  
  // For testing, let's encode "milady" as the value
  const value = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["milady"]);
  
  let nonce = 0; // Start with nonce 0

  console.log("📋 Parameters:");
  console.log(`   Query ID: ${queryId}`);
  console.log(`   Query Data: ${queryData.substring(0, 50)}...`);
  console.log(`   Value: ${value.substring(0, 50)}...`);
  console.log(`   Nonce: ${nonce}`);
  console.log();

  // Check if this queryId already has timestamps (for nonce calculation)
  try {
    const existingTimestamps = await voidContract.timestamps(queryId);
    console.log(`📊 Existing timestamps for this query: ${existingTimestamps.length}`);
    
    if (existingTimestamps.length > 0) {
      console.log(`ℹ️  Note: Nonce should be ${existingTimestamps.length} for new submission`);
      console.log(`   Existing timestamps: ${existingTimestamps.map(t => t.toString())}`);
      // Update nonce to match the array length
      nonce = existingTimestamps.length;
      console.log(`🔄 Updated nonce to: ${nonce}`);
    }
  } catch (error) {
    console.log("📊 No existing timestamps found (this is normal for first submission)");
  }
  console.log();

  try {
    console.log("🔊 Attempting to shout...");
    
    // Manual requirement checks
    console.log("🔍 Checking requirements manually...");
    
    // Check 1: Value must not be empty
    const valueHash = ethers.keccak256(value);
    const emptyHash = ethers.keccak256("0x");
    console.log(`   Value hash: ${valueHash}`);
    console.log(`   Empty hash: ${emptyHash}`);
    console.log(`   ✅ Value not empty: ${valueHash !== emptyHash}`);
    
    // Check 2: Nonce requirement
    const timestampCount = (await voidContract.timestamps(queryId)).length;
    console.log(`   Timestamp count: ${timestampCount}`);
    console.log(`   Nonce: ${nonce}`);
    console.log(`   ✅ Nonce valid: ${nonce === timestampCount || nonce === 0}`);
    
    // Check 3: Query ID requirement
    const computedQueryId = ethers.keccak256(queryData);
    const numericQueryId = parseInt(queryId, 16);
    console.log(`   Computed Query ID: ${computedQueryId}`);
    console.log(`   Provided Query ID: ${queryId}`);
    console.log(`   Numeric Query ID: ${numericQueryId}`);
    console.log(`   ✅ Query ID valid: ${computedQueryId.toLowerCase() === queryId.toLowerCase() || numericQueryId <= 100}`);
    
    // Estimate gas first
    console.log("⛽ Estimating gas...");
    const gasEstimate = await voidContract.shout.estimateGas(
      queryId,
      value,
      nonce,
      queryData
    );
    console.log(`   Estimated gas: ${gasEstimate.toString()}`);
    
    // Execute the transaction
    console.log("📡 Sending transaction...");
    const tx = await voidContract.shout(
      queryId,
      value,
      nonce,
      queryData,
      {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      }
    );
    
    console.log(`   Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Parse the NewShout event
    const shoutEvent = receipt.logs.find(log => {
      try {
        const parsed = voidContract.interface.parseLog(log);
        return parsed.name === "NewShout";
      } catch {
        return false;
      }
    });
    
    if (shoutEvent) {
      const parsed = voidContract.interface.parseLog(shoutEvent);
      console.log();
      console.log("🎉 Shout Event Details:");
      console.log(`   📢 Shouter: ${parsed.args._shouter}`);
      console.log(`   🔑 Query ID: ${parsed.args._queryId}`);
      console.log(`   ⏰ Timestamp: ${new Date(Number(parsed.args._time) * 1000).toLocaleString()}`);
      console.log(`   💬 Value: ${parsed.args._value}`);
      console.log(`   🔢 Nonce: ${parsed.args._nonce}`);
    }
    
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error(`   Message: ${error.message}`);
    
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    
    // Try to provide helpful debugging info
    console.log();
    console.log("🔍 Debugging Information:");
    
    // Check if value is empty
    if (value === "0x" || value === "0x00") {
      console.log("   ⚠️  Value appears to be empty - this will cause 'value must be submitted' error");
    }
    
    // Verify queryId matches queryData hash
    const expectedQueryId = ethers.keccak256(queryData);
    console.log(`   🔗 Expected Query ID (hash): ${expectedQueryId}`);
    console.log(`   🔗 Provided Query ID: ${queryId}`);
    console.log(`   ✅ Query ID matches hash: ${expectedQueryId.toLowerCase() === queryId.toLowerCase()}`);
    
    // Check if it's a simple numeric query ID (<=100)
    const numericQueryId = parseInt(queryId, 16);
    console.log(`   🔢 Numeric value of Query ID: ${numericQueryId}`);
    console.log(`   ✅ Simple Query ID (<=100): ${numericQueryId <= 100}`);
  }
  
  console.log();
  console.log("🏁 Shout test completed");
  console.log("=" .repeat(50));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
