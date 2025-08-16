# EchoToken Contract Testing Guide

This guide shows you how to test the EchoToken contract using Hardhat. The contract is a simple ERC20-like token with basic functionality including minting, burning, transfers, and approvals.

## Setup

The project is already configured with:
- Hardhat framework
- Chai testing library  
- Ethers.js for blockchain interactions
- Multiple Solidity compiler versions (0.8.19 and 0.8.3)

## Contract Functions

### Core ERC20 Functions
- `name()` - Returns token name
- `symbol()` - Returns token symbol  
- `decimals()` - Returns 18 (standard)
- `totalSupply()` - Returns total token supply
- `balanceOf(address)` - Returns token balance for an address
- `transfer(to, amount)` - Transfer tokens to another address
- `approve(spender, amount)` - Approve another address to spend tokens
- `allowance(owner, spender)` - Check approved amount
- `transferFrom(from, to, amount)` - Transfer tokens on behalf of another address

### Additional Functions
- `mint(to, amount)` - Create new tokens (increases total supply)
- `burn(from, amount)` - Destroy tokens (decreases total supply)

## Running Tests

### 1. Compile the Contracts
```bash
npm run compile
```

### 2. Run All Tests
```bash
npm test
```

### 3. Run Tests with Verbose Output
```bash
npm run test:verbose
```

### 4. Run Interactive Demo
```bash
npm run demo
```

## Test Coverage

The comprehensive test suite covers:

### ✅ **Deployment Tests**
- Correct token name and symbol setting
- Proper decimals (18)
- Zero initial supply
- Zero initial balances

### ✅ **Minting Tests** 
- Basic minting functionality
- Multiple address minting
- Large amount handling
- Zero amount edge case
- Total supply tracking

### ✅ **Burning Tests**
- Basic burning functionality
- Underflow protection (fails when burning more than balance)
- Complete balance burning
- Zero amount edge case
- Total supply reduction

### ✅ **Transfer Tests**
- Basic transfers between accounts
- Underflow protection (fails when transferring more than balance)
- Zero amount transfers
- Self-transfers
- Balance tracking

### ✅ **Approval & TransferFrom Tests**
- Approval setting and events
- TransferFrom with sufficient allowance
- TransferFrom failure with insufficient allowance
- Owner can transferFrom their own tokens without approval
- Exact allowance amount handling
- Allowance updates
- Zero allowance setting

### ✅ **View Functions Tests**
- All getter functions return correct values
- State tracking through operations

### ✅ **Edge Cases & Error Conditions**
- Maximum uint256 value handling
- Arithmetic underflow protection
- Multiple consecutive operations
- Gas usage estimation

## Example Test Output

```
  EchoToken
    Deployment
      ✔ Should set the correct token name
      ✔ Should set the correct token symbol
      ✔ Should set correct decimals (18)
      ✔ Should start with zero total supply
      ✔ Should start with zero balance for all accounts
    Minting
      ✔ Should mint tokens and increase total supply
      ✔ Should allow minting to multiple addresses
      ✔ Should allow minting zero tokens (edge case)
      ✔ Should handle large amounts correctly
    Burning
      ✔ Should burn tokens and decrease total supply
      ✔ Should fail when burning more than balance
      ✔ Should allow burning all tokens
      ✔ Should burn zero tokens (edge case)
    Transfer
      ✔ Should transfer tokens between accounts
      ✔ Should fail when transferring more than balance
      ✔ Should allow transferring zero tokens
      ✔ Should allow self-transfer
    Allowance and TransferFrom
      ✔ Should approve spender and emit Approval event
      ✔ Should allow transferFrom with sufficient allowance
      ✔ Should fail transferFrom with insufficient allowance
      ✔ Should allow owner to transferFrom their own tokens without approval
      ✔ Should handle exact allowance amount
      ✔ Should allow updating allowance
      ✔ Should allow setting allowance to zero
    View Functions
      ✔ Should return correct name
      ✔ Should return correct symbol
      ✔ Should return correct decimals
      ✔ Should track total supply correctly through mint/burn operations
      ✔ Should track balances correctly
      ✔ Should track allowances correctly
    Edge Cases and Error Conditions
      ✔ Should handle maximum uint256 values
      ✔ Should fail on arithmetic underflow in transfer
      ✔ Should fail on arithmetic underflow in burn
      ✔ Should handle multiple consecutive operations
    Gas Usage Tests
      ✔ Should estimate gas for common operations

  35 passing (629ms)
```

## Interactive Demo Features

The demo script (`npm run demo`) demonstrates:

1. **Contract Deployment** - Deploys with custom name/symbol
2. **Information Display** - Shows all contract metadata
3. **Minting** - Creates 1000 tokens for owner
4. **Transfer** - Moves 250 tokens to another address
5. **Approval & TransferFrom** - Sets allowance and transfers on behalf
6. **Burning** - Destroys 100 tokens from owner
7. **Final State** - Shows all balances and total supply
8. **Error Cases** - Demonstrates transaction failures

## Gas Usage Information

The tests also provide gas usage estimates:
- Mint: ~68,385 gas
- Transfer: ~51,621 gas  
- Approve: ~46,167 gas

## Key Contract Behaviors

### ⚠️ **Important Notes**
- The contract uses basic arithmetic that will revert on underflow (Solidity 0.8.x)
- No access controls - anyone can call `mint()` and `burn()`
- No maximum supply limit
- TransferFrom allows owners to transfer their own tokens without approval
- All standard ERC20 events are emitted (`Transfer`, `Approval`)

### 🔒 **Security Considerations**  
- Basic underflow protection through Solidity 0.8.x
- No reentrancy guards (not needed for this simple implementation)
- No ownership or permission system
- No pause/emergency stop functionality

## Additional Commands

```bash
# Start local Hardhat node
npm run node

# Open Hardhat console
npm run console

# Clean and recompile
npx hardhat clean && npm run compile
```

This testing setup provides comprehensive coverage of all contract functionality and demonstrates best practices for Hardhat testing with ES modules.
