import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🔊 TheVoidUnsafe Shout Function Demo");
  console.log("=" .repeat(50));

  // Get signers
  const [owner, screamer1, screamer2] = await ethers.getSigners();
  console.log(`👤 Owner: ${owner.address}`);
  console.log(`📢 Screamer1: ${screamer1.address}`);
  console.log(`📢 Screamer2: ${screamer2.address}`);
  console.log();

  // Deploy TheVoidUnsafe contract
  console.log("📦 Deploying TheVoidUnsafe contract...");
  const TheVoidUnsafe = await ethers.getContractFactory("TheVoidUnsafe");
  const voidContract = await TheVoidUnsafe.deploy();
  await voidContract.waitForDeployment();
  
  const contractAddress = await voidContract.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddress}`);
  console.log();

  // Contract info
  console.log("📋 Contract Information:");
  console.log(`   Name: ${await voidContract.name()}`);
  console.log(`   Symbol: ${await voidContract.symbol()}`);
  console.log(`   Decimals: ${await voidContract.decimals()}`);
  console.log();

  // Example 1: Simple shout with string data
  console.log("🔊 Example 1: Simple String Shout");
  const queryData1 = ethers.encodeBytes32String("temperature");
  const queryId1 = ethers.keccak256(queryData1);
  const value1 = ethers.toUtf8Bytes("75.5°F");
  const nonce1 = 0;

  console.log(`   Query Data: "temperature"`);
  console.log(`   Query ID: ${queryId1}`);
  console.log(`   Value: "75.5°F"`);
  console.log(`   Nonce: ${nonce1}`);
  
  // Submit the value (this is the "shout")
  console.log("   Submitting shout...");
  const tx1 = await voidContract.connect(screamer1).submitValue(
    queryId1,
    value1,
    nonce1,
    queryData1
  );
  const receipt1 = await tx1.wait();
  
  // Find the NewShout event
  const shoutEvent1 = receipt1.logs.find(log => {
    try {
      const parsed = voidContract.interface.parseLog(log);
      return parsed.name === "NewShout";
    } catch {
      return false;
    }
  });
  
  if (shoutEvent1) {
    const parsed = voidContract.interface.parseLog(shoutEvent1);
    console.log(`   ✅ Shout successful!`);
    console.log(`   📢 Screamer: ${parsed.args._screamer}`);
    console.log(`   ⏰ Timestamp: ${new Date(Number(parsed.args._time) * 1000).toLocaleString()}`);
    console.log(`   💬 Value: "${ethers.toUtf8String(parsed.args._value)}"`);
  }
  console.log();

  // Example 2: Numeric data shout
  console.log("🔊 Example 2: Numeric Data Shout");
  const queryData2 = ethers.encodeBytes32String("price_btc_usd");
  const queryId2 = ethers.keccak256(queryData2);
  const value2 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [ethers.parseUnits("45000", 18)]);
  const nonce2 = 0;

  console.log(`   Query Data: "price_btc_usd"`);
  console.log(`   Query ID: ${queryId2}`);
  console.log(`   Value: 45000 USD (encoded as uint256)`);
  console.log(`   Nonce: ${nonce2}`);
  
  console.log("   Submitting shout...");
  const tx2 = await voidContract.connect(screamer2).submitValue(
    queryId2,
    value2,
    nonce2,
    queryData2
  );
  const receipt2 = await tx2.wait();
  
  const shoutEvent2 = receipt2.logs.find(log => {
    try {
      const parsed = voidContract.interface.parseLog(log);
      return parsed.name === "NewShout";
    } catch {
      return false;
    }
  });
  
  if (shoutEvent2) {
    const parsed = voidContract.interface.parseLog(shoutEvent2);
    const decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], parsed.args._value)[0];
    console.log(`   ✅ Shout successful!`);
    console.log(`   📢 Screamer: ${parsed.args._screamer}`);
    console.log(`   ⏰ Timestamp: ${new Date(Number(parsed.args._time) * 1000).toLocaleString()}`);
    console.log(`   💰 Value: ${ethers.formatUnits(decodedValue, 18)} USD`);
  }
  console.log();

  // Example 3: Sequential shouts (incrementing nonce)
  console.log("🔊 Example 3: Sequential Shouts");
  const queryData3 = ethers.encodeBytes32String("stock_price_AAPL");
  const queryId3 = ethers.keccak256(queryData3);
  
  const prices = ["150.25", "151.30", "149.85"];
  
  for (let i = 0; i < prices.length; i++) {
    const value = ethers.toUtf8Bytes(`$${prices[i]}`);
    const nonce = i;
    
    console.log(`   Shout ${i + 1}: Price $${prices[i]} (nonce: ${nonce})`);
    
    const tx = await voidContract.connect(screamer1).submitValue(
      queryId3,
      value,
      nonce,
      queryData3
    );
    await tx.wait();
    console.log(`   ✅ Submitted successfully`);
  }
  console.log();

  // Example 4: Using simple query ID (not hash-based)
  console.log("🔊 Example 4: Simple Query ID Shout");
  const simpleQueryId = ethers.zeroPadValue(ethers.toBeHex(42), 32); // Query ID = 42
  const queryData4 = ethers.toUtf8Bytes(""); // Empty query data for simple IDs
  const value4 = ethers.toUtf8Bytes("Hello from The Void!");
  const nonce4 = 0;

  console.log(`   Query ID: 42 (simple numeric ID)`);
  console.log(`   Value: "Hello from The Void!"`);
  
  console.log("   Submitting shout...");
  const tx4 = await voidContract.connect(screamer2).submitValue(
    simpleQueryId,
    value4,
    nonce4,
    queryData4
  );
  const receipt4 = await tx4.wait();
  
  const shoutEvent4 = receipt4.logs.find(log => {
    try {
      const parsed = voidContract.interface.parseLog(log);
      return parsed.name === "NewShout";
    } catch {
      return false;
    }
  });
  
  if (shoutEvent4) {
    const parsed = voidContract.interface.parseLog(shoutEvent4);
    console.log(`   ✅ Shout successful!`);
    console.log(`   📢 Screamer: ${parsed.args._screamer}`);
    console.log(`   💬 Message: "${ethers.toUtf8String(parsed.args._value)}"`);
  }
  console.log();

  // Reading submitted values
  console.log("📖 Reading Submitted Values:");
  console.log("   Temperature query timestamps:", (await voidContract.timestamps(queryId1)).map(t => Number(t)));
  console.log("   Latest temperature:", ethers.toUtf8String(await voidContract.values(queryId1, (await voidContract.timestamps(queryId1))[0])));
  
  const btcTimestamps = await voidContract.timestamps(queryId2);
  if (btcTimestamps.length > 0) {
    const latestBtcValue = await voidContract.values(queryId2, btcTimestamps[0]);
    const decodedBtc = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], latestBtcValue)[0];
    console.log("   Latest BTC price:", ethers.formatUnits(decodedBtc, 18), "USD");
  }
  
  const aaplTimestamps = await voidContract.timestamps(queryId3);
  console.log("   AAPL price history count:", aaplTimestamps.length.toString());
  
  console.log("   Simple query (ID 42):", ethers.toUtf8String(await voidContract.values(simpleQueryId, (await voidContract.timestamps(simpleQueryId))[0])));
  console.log();

  // Check screamer stats
  console.log("📊 Screamer Statistics:");
  const screamer1Stats = await voidContract.getStakerInfo(screamer1.address);
  const screamer2Stats = await voidContract.getStakerInfo(screamer2.address);
  
  console.log(`   Screamer1 reports submitted: ${screamer1Stats.reportsSubmitted}`);
  console.log(`   Screamer2 reports submitted: ${screamer2Stats.reportsSubmitted}`);
  console.log();

  // Error demonstration
  console.log("⚠️  Error Demonstrations:");
  
  try {
    console.log("   Trying to submit empty value...");
    await voidContract.submitValue(queryId1, "0x", 1, queryData1);
  } catch (error) {
    console.log(`   ❌ Expected error: ${error.reason || "value must be submitted"}`);
  }
  
  try {
    console.log("   Trying to submit with wrong nonce...");
    await voidContract.submitValue(queryId1, ethers.toUtf8Bytes("wrong nonce"), 999, queryData1);
  } catch (error) {
    console.log(`   ❌ Expected error: ${error.reason || "nonce must match timestamp index"}`);
  }

  console.log();
  console.log("🎉 Shout demo completed successfully!");
  console.log("=" .repeat(50));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
