pragma solidity >=0.4.21;

pragma solidity >=0.4.21;

import "./Pair.sol";

contract Factory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairDeployed(
        address indexed token0,
        address indexed token1,
        address pair
    );

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function createPair(address token0, address token1)
        external
        returns (address pair)
    {
        // requirements
        require(token0 != token1, "Tokens cannot be the same.");
        // TODO: Check pair doesn't exist

        // instantiate new pool
        pair = address(new Pair(token0, token1));

        // record new pair address
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;

        allPairs.push(pair);

        emit PairDeployed(token0, token1, pair);
    }
}
