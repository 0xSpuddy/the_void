import hre from "hardhat";
import dotenv from "dotenv";
const { ethers } = hre;

// Load environment variables
dotenv.config();

async function main() {
  console.log("🔊 Simple Shout Test");
  console.log("=" .repeat(30));

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}`);
  
  // Contract address from environment variable
  const contractAddress = process.env.THE_VOID_CONTRACT_ADDR || "0xCF6b75b6f2784BFBE2282010C638d0E9197cAbd7";
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  const voidContract = TheVoidUnsafe.attach(contractAddress);
  
  console.log(`📡 Contract: ${contractAddress}`);

  // Use the standardized values you provided
  const queryData = "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000116153684f7554694e744f744865566f496400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c57696c6c42654563686f65640000000000000000000000000000000000000000";
  
  const queryId = "0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89";
  
  // Encode "milady" as a string
  const value = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["milady"]);
  
  const nonce = 0;

  console.log(`🔑 Query ID: ${queryId}`);
  console.log(`💬 Value: "milady" (encoded)`);
  console.log(`🔢 Nonce: ${nonce}`);
  console.log();

  try {
    console.log("🔊 Shouting...");
    
    const tx = await voidContract.shout(
      queryId,
      value,
      nonce,
      queryData,
      { gasLimit: 300000 } // Set a reasonable gas limit
    );
    
    console.log(`✅ Transaction sent: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`🎉 Success! Block: ${receipt.blockNumber}`);
    
    // Look for the NewShout event
    for (const log of receipt.logs) {
      try {
        const parsed = voidContract.interface.parseLog(log);
        if (parsed.name === "NewShout") {
          console.log(`📢 Shout Event:`);
          console.log(`   Shouter: ${parsed.args._shouter}`);
          console.log(`   Query ID: ${parsed.args._queryId}`);
          console.log(`   Time: ${new Date(Number(parsed.args._time) * 1000).toLocaleString()}`);
          console.log(`   Nonce: ${parsed.args._nonce}`);
          // Try to decode the value as a string
          try {
            const decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(["string"], parsed.args._value)[0];
            console.log(`   Value: "${decodedValue}"`);
          } catch {
            console.log(`   Value (raw): ${parsed.args._value}`);
          }
        }
      } catch {
        // Skip non-parseable logs
      }
    }
    
  } catch (error) {
    console.error("❌ Shout failed:");
    console.error(`   Message: ${error.message}`);
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
    
    // Try with different nonce values
    console.log();
    console.log("🔄 Trying with nonce = 1...");
    try {
      const tx2 = await voidContract.shout(
        queryId,
        value,
        1, // Try nonce 1
        queryData,
        { gasLimit: 300000 }
      );
      console.log(`✅ Success with nonce 1: ${tx2.hash}`);
      await tx2.wait();
      console.log("🎉 Transaction confirmed!");
    } catch (error2) {
      console.error(`❌ Also failed with nonce 1: ${error2.message}`);
    }
  }

  console.log();
  console.log("🏁 Test completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
