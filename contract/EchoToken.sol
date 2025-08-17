//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.19;

// ENS Reverse Registrar interface
interface IReverseRegistrar {
    function node(address addr) external pure returns (bytes32);
}

// ENS Registry interface
interface IENS {
    function resolver(bytes32 node) external view returns (address);
}

// ENS Resolver interface for name resolution
interface INameResolver {
    function name(bytes32 node) external view returns (string memory);
}

contract EchoToken{

    //storage
    string  private tokenName;
    string  private tokenSymbol;
    uint256 internal supply;//totalSupply
    mapping(address => uint) balance;
    mapping(address => mapping(address=>uint)) userAllowance;//allowance
    
    // ENS contract addresses (mainnet)
    address constant ENS_REGISTRY = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
    address constant REVERSE_REGISTRAR = 0x084b1c3C81545d370f3634392De611CaaBFf8148;
    
    // Configuration
    bool public ensCheckEnabled = true;
    address public owner;
    
    // Events
    event ENSCheckFailed(address recipient, string reason);
    event ENSCheckStatusChanged(bool enabled);

    //events
    event Approval(address indexed _src, address indexed _dst, uint _amt);
    event Transfer(address indexed _src, address indexed _dst, uint _amt);

    //modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    //functions
    /**
     * @dev Constructor to initialize token
     * @param _name of token
     * @param _symbol of token
     */
    constructor(string memory _name, string memory _symbol){
        tokenName = _name;
        tokenSymbol = _symbol;
        owner = msg.sender;
    }

    /**
     * @dev allows a user to approve a spender of their tokens
     * @param _spender address of party granting approval
     * @param _amount amount of tokens to allow spender access
     */
    function approve(address _spender, uint256 _amount) external returns (bool) {
        userAllowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     * @dev function to transfer tokens
     * @param _to destination of tokens
     * @param _amount of tokens
     */
    function transfer(address _to, uint256 _amount) external returns (bool) {
        _move(msg.sender, _to, _amount);
        return true;
    }

    /**
     * @dev allows a party to transfer tokens from an approved address
     * @param _from address source of tokens 
     * @param _to address destination of tokens
     * @param _amount uint256 amount of tokens
     */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        require(msg.sender == _from || _amount <= userAllowance[_from][msg.sender], "not approved");
        _move(_from,_to,_amount);
        if (msg.sender != _from) {
            userAllowance[_from][msg.sender] = userAllowance[_from][msg.sender] -  _amount;
            emit Approval(_from, msg.sender, userAllowance[_from][msg.sender]);
        }
        return true;
    }

    //Getters
    /**
     * @dev retrieves standard token allowance
     * @param _src user who owns tokens
     * @param _dst spender (destination) of these tokens
     * @return uint256 allowance
     */
    function allowance(address _src, address _dst) external view returns (uint256) {
        return userAllowance[_src][_dst];
    }

    /**
     * @dev retrieves balance of token holder
     * @param _user address of token holder
     * @return uint256 balance of tokens
     */
    function balanceOf(address _user) external view returns (uint256) {
        return balance[_user];
    }
    
    /**
     * @dev retrieves token number of decimals
     * @return uint8 number of decimals (18 standard)
     */
    function decimals() external pure returns(uint8) {
        return 18;
    }

    /**
     * @dev retrieves name of token
     * @return string token name
     */
    function name() external view returns (string memory) {
        return tokenName;
    }

    /**
     * @dev retrieves symbol of token
     * @return string token sybmol
     */
    function symbol() external view returns (string memory) {
        return tokenSymbol;
    }

    /**
     * @dev retrieves totalSupply of token
     * @return amount of token
     */
    function totalSupply() external view returns (uint256) {
        return supply;
    }
    
    /**
     * @dev checks if an address has a configured primary ENS name (public view)
     * @param _addr address to check for ENS name
     * @return bool true if address has a valid ENS name, false otherwise
     */
    function hasENSName(address _addr) external view returns (bool) {
        return _hasENSName(_addr);
    }
    
    /**
     * @dev allows owner to toggle ENS checking functionality
     * @param _enabled whether ENS checking should be enabled
     */
    function setENSCheckEnabled(bool _enabled) external onlyOwner {
        ensCheckEnabled = _enabled;
        emit ENSCheckStatusChanged(_enabled);
    }

    //internal
    
    /**
     * @dev checks if an address has a configured primary ENS name
     * @param _addr address to check for ENS name
     * @return bool true if address has a valid ENS name, false otherwise
     */
    function _hasENSName(address _addr) internal view returns (bool) {
        try IReverseRegistrar(REVERSE_REGISTRAR).node(_addr) returns (bytes32 node) {
            if (node == bytes32(0)) {
                return false;
            }
            
            try IENS(ENS_REGISTRY).resolver(node) returns (address resolver) {
                if (resolver == address(0)) {
                    return false;
                }
                
                try INameResolver(resolver).name(node) returns (string memory ensName) {
                    // Check if the returned name is not empty
                    return bytes(ensName).length > 0;
                } catch {
                    return false;
                }
            } catch {
                return false;
            }
        } catch {
            return false;
        }
    }
    
    /**
     * @dev burns tokens
     * @param _from address to burn tokens from
     * @param _amount amount of token to burn
     */
    function _burn(address _from, uint256 _amount) internal {
        balance[_from] = balance[_from] - _amount;//will overflow if too big
        supply = supply - _amount;
        emit Transfer(_from, address(0), _amount);
    }

    /**
     * @dev mints tokens
     * @param _to address of recipient
     * @param _amount amount of token to send
     */
    function _mint(address _to,uint256 _amount) internal {
        balance[_to] = balance[_to] + _amount;
        supply = supply + _amount;
        emit Transfer(address(0), _to, _amount);
    }

    /**
     * @dev moves tokens from one address to another
     * @param _src address of sender
     * @param _dst address of recipient
     * @param _amount amount of token to send
     */
    function _move(address _src, address _dst, uint256 _amount) internal virtual{
        // Check if recipient has ENS name configured before allowing transfer (if enabled)
        if (ensCheckEnabled && !_hasENSName(_dst)) {
            emit ENSCheckFailed(_dst, "Recipient does not have a configured primary ENS name");
            revert("Transfer failed: Recipient must have a configured primary ENS name");
        }
        
        balance[_src] = balance[_src] - _amount;//will overflow if too big
        balance[_dst] = balance[_dst] + _amount;
        emit Transfer(_src, _dst, _amount);
    }
    function burn(address _account, uint256 _amount) external virtual {
        _burn(_account,_amount);
    }
    
    function mint(address _account, uint256 _amount) external virtual {
        _mint(_account,_amount);
    }
}