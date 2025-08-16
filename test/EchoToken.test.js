import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("EchoToken", function () {
  let EchoToken;
  let echoToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const TOKEN_NAME = "TestEcho";
  const TOKEN_SYMBOL = "TECHO";

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    EchoToken = await ethers.getContractFactory("EchoToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract with name and symbol
    echoToken = await EchoToken.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await echoToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name", async function () {
      expect(await echoToken.name()).to.equal(TOKEN_NAME);
    });

    it("Should set the correct token symbol", async function () {
      expect(await echoToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set correct decimals (18)", async function () {
      expect(await echoToken.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      expect(await echoToken.totalSupply()).to.equal(0);
    });

    it("Should start with zero balance for all accounts", async function () {
      expect(await echoToken.balanceOf(owner.address)).to.equal(0);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(0);
      expect(await echoToken.balanceOf(addr2.address)).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens and increase total supply", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(echoToken.mint(addr1.address, mintAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);

      expect(await echoToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await echoToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should allow minting to multiple addresses", async function () {
      const mintAmount1 = ethers.parseEther("500");
      const mintAmount2 = ethers.parseEther("300");
      
      await echoToken.mint(addr1.address, mintAmount1);
      await echoToken.mint(addr2.address, mintAmount2);

      expect(await echoToken.balanceOf(addr1.address)).to.equal(mintAmount1);
      expect(await echoToken.balanceOf(addr2.address)).to.equal(mintAmount2);
      expect(await echoToken.totalSupply()).to.equal(mintAmount1 + mintAmount2);
    });

    it("Should allow minting zero tokens (edge case)", async function () {
      await expect(echoToken.mint(addr1.address, 0))
        .to.emit(echoToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 0);

      expect(await echoToken.balanceOf(addr1.address)).to.equal(0);
      expect(await echoToken.totalSupply()).to.equal(0);
    });

    it("Should handle large amounts correctly", async function () {
      const largeAmount = ethers.parseEther("1000000000"); // 1 billion tokens
      
      await echoToken.mint(addr1.address, largeAmount);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(largeAmount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to burn
      const mintAmount = ethers.parseEther("10000");
      await echoToken.mint(addr1.address, mintAmount);
    });

    it("Should burn tokens and decrease total supply", async function () {
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await echoToken.balanceOf(addr1.address);
      const initialSupply = await echoToken.totalSupply();
      
      await expect(echoToken.burn(addr1.address, burnAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

      expect(await echoToken.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await echoToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should fail when burning more than balance", async function () {
      const balance = await echoToken.balanceOf(addr1.address);
      const excessiveAmount = balance + ethers.parseEther("1");
      
      // This should cause an underflow and revert
      await expect(echoToken.burn(addr1.address, excessiveAmount))
        .to.be.reverted;
    });

    it("Should allow burning all tokens", async function () {
      const balance = await echoToken.balanceOf(addr1.address);
      
      await echoToken.burn(addr1.address, balance);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should burn zero tokens (edge case)", async function () {
      const initialBalance = await echoToken.balanceOf(addr1.address);
      
      await expect(echoToken.burn(addr1.address, 0))
        .to.emit(echoToken, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, 0);

      expect(await echoToken.balanceOf(addr1.address)).to.equal(initialBalance);
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      // Mint some tokens for transfer tests
      const mintAmount = ethers.parseEther("10000");
      await echoToken.mint(owner.address, mintAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("1000");
      const initialOwnerBalance = await echoToken.balanceOf(owner.address);
      
      await expect(echoToken.transfer(addr1.address, transferAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);

      expect(await echoToken.balanceOf(owner.address)).to.equal(initialOwnerBalance - transferAmount);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should fail when transferring more than balance", async function () {
      const balance = await echoToken.balanceOf(owner.address);
      const excessiveAmount = balance + ethers.parseEther("1");
      
      await expect(echoToken.transfer(addr1.address, excessiveAmount))
        .to.be.reverted;
    });

    it("Should allow transferring zero tokens", async function () {
      const initialBalance = await echoToken.balanceOf(owner.address);
      
      await expect(echoToken.transfer(addr1.address, 0))
        .to.emit(echoToken, "Transfer")
        .withArgs(owner.address, addr1.address, 0);

      expect(await echoToken.balanceOf(owner.address)).to.equal(initialBalance);
    });

    it("Should allow self-transfer", async function () {
      const transferAmount = ethers.parseEther("100");
      const initialBalance = await echoToken.balanceOf(owner.address);
      
      await expect(echoToken.transfer(owner.address, transferAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(owner.address, owner.address, transferAmount);

      expect(await echoToken.balanceOf(owner.address)).to.equal(initialBalance);
    });
  });

  describe("Allowance and TransferFrom", function () {
    beforeEach(async function () {
      // Mint some tokens for allowance tests
      const mintAmount = ethers.parseEther("10000");
      await echoToken.mint(owner.address, mintAmount);
    });

    it("Should approve spender and emit Approval event", async function () {
      const approvalAmount = ethers.parseEther("1000");
      
      await expect(echoToken.approve(addr1.address, approvalAmount))
        .to.emit(echoToken, "Approval")
        .withArgs(owner.address, addr1.address, approvalAmount);

      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(approvalAmount);
    });

    it("Should allow transferFrom with sufficient allowance", async function () {
      const approvalAmount = ethers.parseEther("1000");
      const transferAmount = ethers.parseEther("500");
      
      // Approve first
      await echoToken.approve(addr1.address, approvalAmount);
      
      // Transfer from
      await expect(echoToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(owner.address, addr2.address, transferAmount)
        .and.to.emit(echoToken, "Approval")
        .withArgs(owner.address, addr1.address, approvalAmount - transferAmount);

      expect(await echoToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(approvalAmount - transferAmount);
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      const approvalAmount = ethers.parseEther("500");
      const transferAmount = ethers.parseEther("1000");
      
      await echoToken.approve(addr1.address, approvalAmount);
      
      await expect(echoToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount))
        .to.be.revertedWith("not approved");
    });

    it("Should allow owner to transferFrom their own tokens without approval", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      await expect(echoToken.transferFrom(owner.address, addr1.address, transferAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);

      expect(await echoToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should handle exact allowance amount", async function () {
      const approvalAmount = ethers.parseEther("1000");
      
      await echoToken.approve(addr1.address, approvalAmount);
      
      await expect(echoToken.connect(addr1).transferFrom(owner.address, addr2.address, approvalAmount))
        .to.emit(echoToken, "Transfer")
        .withArgs(owner.address, addr2.address, approvalAmount);

      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should allow updating allowance", async function () {
      const firstApproval = ethers.parseEther("1000");
      const secondApproval = ethers.parseEther("2000");
      
      await echoToken.approve(addr1.address, firstApproval);
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(firstApproval);
      
      await echoToken.approve(addr1.address, secondApproval);
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(secondApproval);
    });

    it("Should allow setting allowance to zero", async function () {
      const approvalAmount = ethers.parseEther("1000");
      
      await echoToken.approve(addr1.address, approvalAmount);
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(approvalAmount);
      
      await echoToken.approve(addr1.address, 0);
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct name", async function () {
      expect(await echoToken.name()).to.equal(TOKEN_NAME);
    });

    it("Should return correct symbol", async function () {
      expect(await echoToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should return correct decimals", async function () {
      expect(await echoToken.decimals()).to.equal(18);
    });

    it("Should track total supply correctly through mint/burn operations", async function () {
      expect(await echoToken.totalSupply()).to.equal(0);
      
      const mintAmount = ethers.parseEther("5000");
      await echoToken.mint(addr1.address, mintAmount);
      expect(await echoToken.totalSupply()).to.equal(mintAmount);
      
      const burnAmount = ethers.parseEther("2000");
      await echoToken.burn(addr1.address, burnAmount);
      expect(await echoToken.totalSupply()).to.equal(mintAmount - burnAmount);
    });

    it("Should track balances correctly", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      expect(await echoToken.balanceOf(addr1.address)).to.equal(0);
      
      await echoToken.mint(addr1.address, mintAmount);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should track allowances correctly", async function () {
      const approvalAmount = ethers.parseEther("500");
      
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(0);
      
      await echoToken.approve(addr1.address, approvalAmount);
      expect(await echoToken.allowance(owner.address, addr1.address)).to.equal(approvalAmount);
    });
  });

  describe("Edge Cases and Error Conditions", function () {
    it("Should handle maximum uint256 values", async function () {
      const maxUint256 = ethers.MaxUint256;
      
      // This might fail due to gas limits, but tests the contract logic
      try {
        await echoToken.mint(addr1.address, maxUint256);
        expect(await echoToken.balanceOf(addr1.address)).to.equal(maxUint256);
      } catch (error) {
        // Expected to fail due to gas limits, not contract logic
        expect(error.message).to.include("gas");
      }
    });

    it("Should fail on arithmetic underflow in transfer", async function () {
      // Try to transfer without having tokens
      await expect(echoToken.connect(addr1).transfer(addr2.address, ethers.parseEther("1")))
        .to.be.reverted;
    });

    it("Should fail on arithmetic underflow in burn", async function () {
      // Try to burn without having tokens
      await expect(echoToken.burn(addr1.address, ethers.parseEther("1")))
        .to.be.reverted;
    });

    it("Should handle multiple consecutive operations", async function () {
      const amount = ethers.parseEther("1000");
      
      // Mint
      await echoToken.mint(addr1.address, amount);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(amount);
      
      // Transfer
      await echoToken.connect(addr1).transfer(addr2.address, amount / 2n);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(amount / 2n);
      expect(await echoToken.balanceOf(addr2.address)).to.equal(amount / 2n);
      
      // Approve and transferFrom
      await echoToken.connect(addr2).approve(owner.address, amount / 4n);
      await echoToken.transferFrom(addr2.address, addr1.address, amount / 4n);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(amount * 3n / 4n);
      expect(await echoToken.balanceOf(addr2.address)).to.equal(amount / 4n);
      
      // Burn
      await echoToken.burn(addr1.address, amount / 4n);
      expect(await echoToken.balanceOf(addr1.address)).to.equal(amount / 2n);
      expect(await echoToken.totalSupply()).to.equal(amount * 3n / 4n);
    });
  });

  describe("Gas Usage Tests", function () {
    it("Should estimate gas for common operations", async function () {
      // Mint
      const mintTx = await echoToken.mint.populateTransaction(addr1.address, ethers.parseEther("1000"));
      const mintGas = await ethers.provider.estimateGas(mintTx);
      console.log(`Mint gas usage: ${mintGas.toString()}`);
      
      // Mint some tokens first
      await echoToken.mint(owner.address, ethers.parseEther("10000"));
      
      // Transfer
      const transferTx = await echoToken.transfer.populateTransaction(addr1.address, ethers.parseEther("1000"));
      const transferGas = await ethers.provider.estimateGas(transferTx);
      console.log(`Transfer gas usage: ${transferGas.toString()}`);
      
      // Approve
      const approveTx = await echoToken.approve.populateTransaction(addr1.address, ethers.parseEther("1000"));
      const approveGas = await ethers.provider.estimateGas(approveTx);
      console.log(`Approve gas usage: ${approveGas.toString()}`);
    });
  });
});