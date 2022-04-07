pragma solidity >=0.8.0;

import "@rari-capital/solmate/src/tokens/ERC20.sol";

import "./libraries/Math.sol";
import "./libraries/UQ112x112.sol";
import "./TWAMM.sol";

contract Pair is ERC20 {
    using UQ112x112 for uint224;

    address public factory;
    address public immutable token0;
    address public immutable token1;
    string public token0Name;
    string public token1Name;

    uint256 public price0Cumulative;
    uint256 public price1Cumulative;

    uint112 x;
    uint112 y;
    uint32 public lastBlockTimestamp;

    /// @dev twamm state
    TWAMM.OrderPools orderPools;

    event Swap();
    event MintLiquidity();
    event BurnLiquidity();
    event CreateLongTermOrder();
    event CancelLongTermOrder();
    event WithdrawLongTermOrder();

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
        TWAMM.initialize(orderPools, _token0, _token1, _twammIntervalSize);
    }

    function getAmounts()
        external
        view
        returns (uint112 amount0, uint112 amount1)
    {
        amount0 = x;
        amount1 = y;
    }

    function getLongTermOrderInterval()
        external
        view
        returns (uint256 blockInterval)
    {
        blockInterval = orderPools.orderExpireInterval;
    }

    /// @notice method for providing liquidity
    /// @param _amountInX - number of X tokens user wants to provide
    /// @param _amountInY - number of Y tokens user wants to provide
    function mint(
        address _to,
        uint256 _amountInX,
        uint256 _amountInY
    ) external returns (uint256 liquidity) {
        // executeVirtualOrders / computeVirtualBalances -- get x and y up to date
        //(x, y) = TWAMM.executeVirtualOrders(orderPools, x, y);

        (uint256 optAmountX, uint256 optAmountY) = _optimalLiquidity(
            _amountInX,
            _amountInY
        );

        // handle transfers
        ERC20(token0).transferFrom(msg.sender, address(this), optAmountX);
        ERC20(token1).transferFrom(msg.sender, address(this), optAmountY);

        // calculate liquidity
        if (totalSupply == 0) {
            liquidity = Math.sqrt(optAmountX * optAmountY);
        } else {
            liquidity = Math.min(
                (optAmountX * totalSupply) / x,
                (optAmountY * totalSupply) / y
            );
        }
        _mint(_to, liquidity); // ERC-20 function
        // _update()

        x = x + uint112(optAmountX);
        y = y + uint112(optAmountY);

        emit MintLiquidity();
    }

    function _optimalLiquidity(uint256 desiredAmount0, uint256 desiredAmount1)
        internal
        view
        returns (uint256 amountX, uint256 amountY)
    {
        // Empty pair with no liquidity
        if (x == 0 && y == 0) {
            (amountX, amountY) = (desiredAmount0, desiredAmount1);
        } else {
            uint256 optimalAmount1 = (desiredAmount0 * y) / x;
            if (optimalAmount1 <= desiredAmount1) {
                (amountX, amountY) = (desiredAmount0, optimalAmount1);
            } else {
                uint256 optimalAmount0 = (desiredAmount1 * x) / y;
                (amountX, amountY) = (optimalAmount0, desiredAmount1);
            }
        }
    }

    /// @notice method for burning liquidity
    // function burn(address to)
    //     external
    //     returns (uint256 amount0, uint256 amount1)
    // {
    //     uint256 liquidity = balanceOf[address(this)];

    //     // calculate token amounts
    //     amount0 = (liquidity * x) / totalSupply;
    //     amount1 = (liquidity * y) / totalSupply;

    //     // Update balances
    //     x -= uint112(amount0);
    //     y -= uint112(amount1);

    //     // ERC-20 burn liquidity tokens
    //     _burn(address(this), liquidity);

    //     // Transfer tokens back to LP
    //     ERC20(token0).transfer(to, amount0);
    //     ERC20(token1).transfer(to, amount1);

    //     emit BurnLiquidity();
    // }

    // This disregards fees for now
    /// @notice execute long term swap
    /// @param _amountIn - number of tokens user wants to swap
    /// @param _tokenInIsX - true if swapping X to Y and false vice versa
    /// @param _to - user/wallet address to which the newly received tokens are sent
    function swap(
        uint256 _amountIn,
        bool _tokenInIsX,
        address _to
    ) external {
        // executeVirtualOrders / computeVirtualBalances -- get x and y up to date
        if (_tokenInIsX) {
            ERC20(token0).transferFrom(msg.sender, address(this), _amountIn);
            uint256 yOut = (_amountIn * uint256(y)) / (_amountIn + uint256(x));
            if (yOut > 0) {
                ERC20(token1).transfer(_to, yOut);
                // _update(x + uint112(_amountIn), y - uint112(yOut), x, y)
                x += uint112(_amountIn);
                y -= uint112(yOut);
            }
        } else {
            ERC20(token1).transferFrom(msg.sender, address(this), _amountIn);
            uint256 xOut = (_amountIn * uint256(x)) / (_amountIn + uint256(y));
            if (xOut > 0) {
                ERC20(token0).transfer(_to, xOut);
                // _update(x - uint112(xOut), y + uint112(_amountIn), x, y)
                x -= uint112(xOut);
                y += uint112(_amountIn);
            }
        }
        emit Swap();
    }

    /// @notice execute long term swap
    /// @param _amountIn - number of tokens user wants to swap
    /// @param _tokenInIsX - true if swapping X to Y and false vice versa
    /// @param _numIntervals - number of intervals over which to split the LTO
    function longTermSwap(
        uint256 _amountIn,
        bool _tokenInIsX,
        uint256 _numIntervals
    ) external {
        // setting direction of swap
        address inToken;
        address outToken;

        if (_tokenInIsX) {
            inToken = token0;
            outToken = token1;
        } else {
            inToken = token1;
            outToken = token0;
        }

        // interval calculations
        uint256 nextIntervalBlock = block.number +
            (orderPools.orderExpireInterval -
                (block.number % orderPools.orderExpireInterval));
        uint256 endIntervalBlock = nextIntervalBlock +
            (_numIntervals * orderPools.orderExpireInterval);

        // execute erc20 transfers
        // NOTE: msg.sender might not be correct here...
        ERC20(inToken).transferFrom(msg.sender, address(this), _amountIn);

        // calculate per block sales rate
        uint256 blockSalesRate = (_amountIn * 1000) /
            (endIntervalBlock - uint256(block.number));

        // create LongTermSwap
        TWAMM.createVirtualOrder(
            orderPools,
            inToken,
            outToken,
            endIntervalBlock,
            blockSalesRate
        );

        emit CreateLongTermOrder();
    }

    // Removing for now - currently not returning order ids to users so not useful
    // If we did, we should probably add a check to make sure the order they are retrieving
    // belongs to them?

    // /// @notice retrieve long term swap by id
    // function getLongTermSwapXtoY(uint256 _id)
    //     external
    //     view
    //     returns (TWAMM.LongTermOrder memory order)
    // {
    //     order = orderPools.pools[token0][token1].orders[_id];
    // }

    // /// @notice retrieve long term swap by id
    // function getLongTermSwapYtoX(uint256 _id)
    //     external
    //     view
    //     returns (TWAMM.LongTermOrder memory order)
    // {
    //     order = orderPools.pools[token1][token0].orders[_id];
    // }

    /// @notice fetch orders by creator
    function getCreatedLongTermOrders()
        external
        view
        returns (
            TWAMM.LongTermOrder[] memory ordersXtoY,
            TWAMM.LongTermOrder[] memory ordersYtoX
        )
    {
        ordersXtoY = _getCreatedOrderPool(orderPools.pools[token0][token1]);
        ordersYtoX = _getCreatedOrderPool(orderPools.pools[token1][token0]);
    }

    function _getCreatedOrderPool(TWAMM.OrderPool storage pool)
        private
        view
        returns (TWAMM.LongTermOrder[] memory orders)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < pool.orderId; i++) {
            if (pool.orders[i].creator == msg.sender) count++;
        }

        uint256 pos = 0;
        orders = new TWAMM.LongTermOrder[](count);
        for (uint256 j = 0; j < pool.orderId; j++) {
            if (pool.orders[j].creator == msg.sender)
                orders[pos++] = pool.orders[j];
        }
    }

    // function cancelLongTermOrder(
    //     uint256 _id,
    //     address _token0,
    //     address _token1
    // ) external {
    //     TWAMM.cancelVirtualOrder(orderPools, _id, _token0, _token1);
    //     emit CancelLongTermOrder();
    // }

    // function withdrawLongTermOrder(
    //     uint256 _id,
    //     address _token0,
    //     address _token1
    // ) external {
    //     TWAMM.cancelVirtualOrder(orderPools, _id, _token0, _token1);
    //     emit WithdrawLongTermOrder();
    // }
}
