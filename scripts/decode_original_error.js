import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🔍 Decoding Original Error Transaction Data");
  console.log("=" .repeat(50));

  // This is the transaction data from your original error
  const originalTxData = "0x5eaa9cedb6495249d47095940941da324ebfbaf8c404d1ca60d8772d3a710eced4553c2f0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000066d696c616479000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000116153684f7554694e744f744865566f496400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c57696c6c42654563686f65640000000000000000000000000000000000000000";

  try {
    // Get the contract factory to access the interface
    const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
    
    // Get the function selector (first 4 bytes)
    const selector = originalTxData.slice(0, 10);
    console.log(`Function selector: ${selector}`);
    
    // Try to decode the transaction data
    const decodedData = TheVoidUnsafe.interface.parseTransaction({ data: originalTxData });
    
    console.log(`Function name: ${decodedData.name}`);
    console.log(`Arguments:`);
    
    for (let i = 0; i < decodedData.args.length; i++) {
      const arg = decodedData.args[i];
      console.log(`   Arg ${i} (${decodedData.fragment.inputs[i].name}): ${arg}`);
      
      // Try to decode if it looks like encoded data
      if (typeof arg === 'string' && arg.startsWith('0x') && arg.length > 10) {
        try {
          // Try to decode as string
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], arg);
          console.log(`     Decoded as string: "${decoded[0]}"`);
        } catch {
          console.log(`     (Could not decode as string)`);
        }
      }
    }
    
    // Check the specific function being called
    if (decodedData.name === "shout") {
      const [queryId, value, nonce, queryData] = decodedData.args;
      
      console.log();
      console.log("📋 Shout Parameters Analysis:");
      console.log(`   Query ID: ${queryId}`);
      console.log(`   Value length: ${value.length} characters`);
      console.log(`   Nonce: ${nonce}`);
      console.log(`   Query Data length: ${queryData.length} characters`);
      
      // Check if value is empty
      if (value === "0x" || value === "") {
        console.log("   ⚠️  WARNING: Value appears to be empty!");
      }
      
      // Try to decode the value
      try {
        const decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(['string'], value);
        console.log(`   Value decoded: "${decodedValue[0]}"`);
      } catch (error) {
        console.log(`   Value decode error: ${error.message}`);
      }
      
      // Check query ID vs query data hash
      const computedQueryId = ethers.keccak256(queryData);
      console.log(`   Query Data Hash: ${computedQueryId}`);
      console.log(`   Query IDs match: ${computedQueryId.toLowerCase() === queryId.toLowerCase()}`);
    }
    
  } catch (error) {
    console.error("❌ Decoding failed:");
    console.error(error.message);
    
    // Manual decoding attempt
    console.log();
    console.log("🔧 Attempting manual decode...");
    
    // Remove function selector
    const paramData = "0x" + originalTxData.slice(10);
    console.log(`Parameter data: ${paramData.slice(0, 100)}...`);
    
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['bytes32', 'bytes', 'uint256', 'bytes'],
        paramData
      );
      
      console.log("Manual decode result:");
      console.log(`   Query ID: ${decoded[0]}`);
      console.log(`   Value: ${decoded[1]}`);
      console.log(`   Nonce: ${decoded[2]}`);
      console.log(`   Query Data: ${decoded[3].slice(0, 100)}...`);
      
    } catch (manualError) {
      console.error("Manual decode also failed:", manualError.message);
    }
  }
}

main().catch(console.error);
