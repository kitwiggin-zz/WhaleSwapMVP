pragma solidity >=0.6.0;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

contract TestToken1 is ERC20 {
    address public creator;

    constructor() ERC20("Token1", "TKN1", 18) {
        _mint(msg.sender, 900000000);
        creator = msg.sender;
    }
}
