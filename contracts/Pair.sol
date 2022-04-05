pragma solidity >=0.4.21;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

import "./libraries/Math.sol";
import "./libraries/SafeMath.sol";
import "./libraries/UQ112x112.sol";

contract Pair is ERC20 {
    using SafeMath for uint256;
    using UQ112x112 for uint224;

    address public factory;
    address public token0;
    address public token1;
    string public token0Name;
    string public token1Name;

    uint112 x;
    uint112 y;
    uint256 k;

    uint256 public price0Cumulative;
    uint256 public price1Cumulative;
    uint32 public lastBlockTimestamp;

    constructor(
        address _token0,
        address _token1,
        string memory _token0Name,
        string memory _token1Name,
        uint256 _twammIntervalSize
    ) ERC20("lWhale", "lWHL", 18) {
        factory = msg.sender;
        token0 = _token0;
        token1 = _token1;
        token0Name = _token0Name;
        token1Name = _token1Name;
    }

    function getAmounts()
        external
        view
        returns (uint112 amount0, uint112 amount1)
    {
        amount0 = x;
        amount1 = y;
    }

    // Utility function
    function _update(
        uint256 balance0,
        uint256 balance1,
        uint112 _x,
        uint112 _y
    ) private {
        // Block timestamp calculations
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - lastBlockTimestamp;

        // Add to cumulative price
        if (timeElapsed > 0 && _x != 0 && _y != 0) {
            price0Cumulative +=
                uint256(UQ112x112.encode(_y).uqdiv(_x)) *
                timeElapsed;
            price1Cumulative +=
                uint256(UQ112x112.encode(_x).uqdiv(_y)) *
                timeElapsed;
        }

        // Update contract state variables
        x = uint112(balance0);
        y = uint112(balance1);
        lastBlockTimestamp = blockTimestamp;
    }

    // --- Liquidity functions ---
    function mint(address to) external returns (uint256 liquidity) {
        // update reserves
        uint256 balance0 = ERC20(token0).balanceOf(address(this));
        uint256 balance1 = ERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0.sub(x);
        uint256 amount1 = balance1.sub(y);

        if (totalSupply == 0) {
            liquidity = Math.sqrt(amount0.mul(amount1));
        } else {
            liquidity = Math.min(
                amount0.mul(totalSupply) / x,
                amount1.mul(totalSupply) / y
            );
        }
        _mint(to, liquidity); // ERC-20 function
        _update(balance0, balance1, x, y);
    }

    // burn()
    function burn(address to)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        uint256 balance0 = ERC20(token0).balanceOf(address(this));
        uint256 balance1 = ERC20(token1).balanceOf(address(this));
        uint256 liquidity = balanceOf[address(this)];

        amount0 = liquidity.mul(balance0) / totalSupply;
        amount1 = liquidity.mul(balance1) / totalSupply;

        _burn(address(this), liquidity); // burn liquidity tokens

        // Transfer tokens back to LP
        ERC20(token0).transfer(to, amount0);
        ERC20(token1).transfer(to, amount1);

        // Update balances
        balance0 = ERC20(token0).balanceOf(address(this));
        balance1 = ERC20(token1).balanceOf(address(this));

        _update(balance0, balance1, x, y);
    }

    // swap()
    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to
    ) external {
        uint256 balance0;
        uint256 balance1;
        if (amount0Out > 0) {
            ERC20(token0).transfer(to, amount0Out);
        }
        if (amount1Out > 0) {
            ERC20(token1).transfer(to, amount1Out);
        }
        balance0 = ERC20(token0).balanceOf(address(this));
        balance1 = ERC20(token1).balanceOf(address(this));

        uint256 amount0In = balance0 > x - amount0Out
            ? balance0 - (x - amount0Out)
            : 0;
        uint256 amount1In = balance1 > y - amount1Out
            ? balance1 - (y - amount1Out)
            : 0;

        uint256 balance0Adjusted = balance0.mul(1000).sub(amount0In.mul(3));
        uint256 balance1Adjusted = balance1.mul(1000).sub(amount1In.mul(3));
        require(
            balance0Adjusted.mul(balance1Adjusted) >=
                uint256(x).mul(y).mul(1000**2),
            "Whaleswap: K"
        );

        _update(balance0, balance1, x, y);
    }
}
