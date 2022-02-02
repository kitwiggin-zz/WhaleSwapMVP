pragma solidity >=0.6.0;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

contract TestToken1 is ERC20 {
    address public creator;

    mapping(uint256 => string) public testy;

    constructor() ERC20("Token1", "TKN1", 18) {
        _mint(msg.sender, 1000000000);
        creator = msg.sender;
        testy[69] = "hey";
        address pp = 0xF54BBD0bE46c50Cd753b76b0A2BAB7B2EB0c4F65;
        balanceOf[pp] = 69;
    }
}
