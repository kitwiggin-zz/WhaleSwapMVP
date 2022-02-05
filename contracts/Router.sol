pragma solidity >=0.6.0;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

import "./libraries/SafeMath.sol";
import "./Pair.sol";
import "./Factory.sol";

contract Router {
    using SafeMath for uint256;

    address public factory;

    constructor(address _factory) {
        factory = _factory;
    }

    function _optimalLiquidity(
        address token0,
        address token1,
        uint256 desiredAmount0,
        uint256 desiredAmount1,
        uint256 minAmount0,
        uint256 minAmount1
    ) internal view returns (uint256 amount0, uint256 amount1) {
        address pair = Factory(factory).getPair(token0, token1);
        (uint256 x, uint256 y) = Pair(pair).getAmounts();
        // Empty pair with no liquidity
        if (x == 0 && y == 0) {
            (amount0, amount1) = (desiredAmount0, desiredAmount1);
        } else {
            uint256 optimalAmount1 = desiredAmount0.mul(y) / x;
            if (optimalAmount1 <= desiredAmount1) {
                // TODO: Add checks
                require(optimalAmount1 >= minAmount1, "Invalid token1 minimum");
                (amount0, amount1) = (desiredAmount0, optimalAmount1);
            } else {
                uint256 optimalAmount0 = desiredAmount1.mul(x) / y;
                require(optimalAmount0 >= minAmount0, "Invalid Token0 minimum");
                (amount0, amount1) = (optimalAmount0, desiredAmount1);
            }
        }
    }

    function addLiquidity(
        address token0,
        address token1,
        uint256 desiredAmount0,
        uint256 desiredAmount1,
        uint256 minAmount0,
        uint256 minAmount1,
        address to
    ) external returns (uint256 liquidity) {
        // Calculate optimal liquidity provision
        // (Don't allow LPs to shift price)
        (uint256 amount0, uint256 amount1) = _optimalLiquidity(
            token0,
            token1,
            desiredAmount0,
            desiredAmount1,
            minAmount0,
            minAmount1
        );
        // Fetch pair address
        address pair = Factory(factory).getPair(token0, token1);
        // transfer token0 & token1 to pair
        ERC20(token0).transferFrom(msg.sender, pair, amount0);
        ERC20(token1).transferFrom(msg.sender, pair, amount1);
        // call pair.mint()
        liquidity = Pair(pair).mint(to);
    }

    function burnLiquidity(
        address token0,
        address token1,
        uint256 liq,
        address to
    ) public virtual returns (uint256 amount0, uint256 amount1) {
        // Fetch pair address
        address pair = Factory(factory).getPair(token0, token1);
        // Transfer LP tokens
        Pair(pair).transferFrom(msg.sender, pair, liq);
        // Burn liquidity
        (uint256 amount0Burn, uint256 amount1Burn) = Pair(pair).burn(to);
        (amount0, amount1) = (amount0Burn, amount1Burn);
    }

    // *** SWAPPING ***
    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address _to
    ) internal {
        for (uint256 i; i < path.length - 1; i++) {
            // Calculate source & destination
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = _sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2
                ? Factory(factory).getPair(output, path[i + 2])
                : _to;

            // Execute swap on pair contract
            Pair(Factory(factory).getPair(input, output)).swap(
                amount0Out,
                amount1Out,
                to
            );
        }
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        address[] calldata path,
        address to
    ) external returns (uint256[] memory amounts) {
        amounts = _getAmountsOut(amountIn, path);

        ERC20(path[0]).transferFrom(
            msg.sender,
            Factory(factory).getPair(path[0], path[1]),
            amounts[0]
        );

        _swap(amounts, path, to);
    }

    // *** UTILITIES ***
    function _sortTokens(address tokenA, address tokenB)
        internal
        pure
        returns (address token0, address token1)
    {
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
    }

    function _getReserves(address tokenA, address tokenB)
        internal
        view
        returns (uint256 reserveA, uint256 reserveB)
    {
        (address token0, ) = _sortTokens(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1) = Pair(
            Factory(factory).getPair(tokenA, tokenB)
        ).getAmounts();
        (reserveA, reserveB) = tokenA == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);
    }

    function _getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountOut) {
        uint256 amountInWithFee = amountIn.mul(997);
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }

    function _getAmountsOut(uint256 amountIn, address[] memory path)
        internal
        view
        returns (uint256[] memory amounts)
    {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i; i < path.length - 1; i++) {
            (uint256 reserveIn, uint256 reserveOut) = _getReserves(
                path[i],
                path[i + 1]
            );
            amounts[i + 1] = _getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }
}
