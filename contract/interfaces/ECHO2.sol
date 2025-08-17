// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EchoToken
 * @dev An ERC20 token inspired by Tellor's Tributes token
 * @notice This token includes minting, burning, pausing capabilities
 * Features:
 * - Standard ERC20 functionality
 * - Owner-controlled minting
 * - Burnable tokens
 * - Pausable transfers (emergency stop)
 * - Reentrancy protection
 * - Configurable initial supply
 */
contract EchoToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event ContractPaused();
    event ContractUnpaused();
    
    // Constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens max
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    
    // State variables
    uint256 public totalMinted;
    mapping(address => bool) public minters;
    
    // Modifiers
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "EchoToken: caller is not a minter");
        _;
    }
    
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     * @param initialOwner Address of the initial owner
     */
    constructor(address initialOwner) 
        ERC20("EchoToken", "ECHO") 
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
        
        emit TokensMinted(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Creates `amount` new tokens for `to`.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyMinter nonReentrant {
        require(to != address(0), "EchoToken: mint to the zero address");
        require(amount > 0, "EchoToken: amount must be greater than 0");
        require(totalMinted + amount <= MAX_SUPPLY, "EchoToken: would exceed max supply");
        
        _mint(to, amount);
        totalMinted += amount;
        
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param amounts Array of amounts to mint
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyMinter nonReentrant {
        require(recipients.length == amounts.length, "EchoToken: arrays length mismatch");
        require(recipients.length <= 100, "EchoToken: too many recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalMinted + totalAmount <= MAX_SUPPLY, "EchoToken: would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "EchoToken: mint to the zero address");
            require(amounts[i] > 0, "EchoToken: amount must be greater than 0");
            
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
        
        totalMinted += totalAmount;
    }
    
    /**
     * @dev Burns tokens from caller's account
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public override nonReentrant {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Burns tokens from specified account (requires allowance)
     * @param account The account to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public override nonReentrant {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
    
    /**
     * @dev Pauses all token transfers
     * Only the owner can pause the contract
     */
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused();
    }
    
    /**
     * @dev Unpauses all token transfers
     * Only the owner can unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused();
    }
    
    /**
     * @dev Add an address as a minter
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "EchoToken: minter is the zero address");
        minters[minter] = true;
    }
    
    /**
     * @dev Remove an address from minters
     * @param minter Address to remove from minters
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
    }
    
    /**
     * @dev Returns the remaining mintable supply
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }
    
    /**
     * @dev Check if an address is a minter
     * @param account Address to check
     */
    function isMinter(address account) external view returns (bool) {
        return minters[account] || account == owner();
    }
    
    // Override required by Solidity for multiple inheritance
    function _update(address from, address to, uint256 amount) 
        internal 
        override(ERC20, ERC20Pausable) 
    {
        super._update(from, to, amount);
    }
    
    /**
     * @dev Emergency function to recover accidentally sent tokens
     * @param token Address of the token contract
     * @param amount Amount to recover
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "EchoToken: cannot recover own tokens");
        IERC20(token).transfer(owner(), amount);
    }
}
