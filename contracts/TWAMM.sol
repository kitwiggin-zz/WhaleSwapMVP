pragma solidity >=0.8.0;

import "./libraries/Math.sol";
import "@prb/math/contracts/PRBMathSD59x18.sol";

/// @title A library for TWAMM functionality (https://www.paradigm.xyz/2021/07/twamm)
/// @author Ben Leimberger
library TWAMM {
    using Math for uint256;

    struct OrderPools {
        uint256 orderExpireInterval;
        uint256 lastExecutedBlock;
        address tokenX;
        address tokenY;
        mapping(address => mapping(address => OrderPool)) pools;
    }

    struct OrderPool {
        uint256 orderId;
        // will probably change this to bool tokenInIsX
        address tokenX;
        address tokenY;
        uint256 saleRate;
        //uint256 lastExecutionBlock;
        mapping(uint256 => LongTermOrder) orders;
        mapping(uint256 => uint256) expirationByBlockInterval;
    }

    // I'm defining active as true when initialiised but not yet withdrawn/cancelled
    // That is, active will remain as true when it expires until it is withdrawn/cancelled
    // Might be nice to have a second boolean to represent pre and post expiry - maybe later...
    struct LongTermOrder {
        uint256 id;
        address creator;
        uint256 beginBlock;
        uint256 finalBlock;
        uint256 ratePerBlock;
        bool active;
    }

    event OrderCreated(
        uint256 id,
        address token1,
        address token2,
        address creator
    );
    event OrderCancelled(uint256 id, address token1, address token2);

    function initialize(
        OrderPools storage self,
        address _token0,
        address _token1,
        uint256 _orderExpireInterval
    ) internal {
        self.orderExpireInterval = _orderExpireInterval;
        self.lastExecutedBlock = block.number;
        self.tokenX = _token0;
        self.tokenY = _token1;
    }

    // NOTE: have to pass reserves by reference for updating
    // NOTE: access modifier 'internal' inlines the code into calling contract
    function executeVirtualOrders(
        OrderPools storage self,
        uint112 _xStart,
        uint112 _yStart
    ) internal returns (uint112 x, uint112 y) {
        // Set starting x, y and constant k
        x = _xStart;
        y = _yStart;
        uint112 k = x * y;

        // calc number of passed intervals
        uint256 prevIntervalExecuted = self.lastExecutedBlock -
            (self.lastExecutedBlock % self.orderExpireInterval);

        uint256 numIntervalsSinceExecution = (block.number -
            prevIntervalExecuted) / self.orderExpireInterval;

        for (uint16 i = 1; i <= numIntervalsSinceExecution; i++) {
            // The block that represents the first interval ending after the last execution
            uint256 executingInterval = prevIntervalExecuted +
                (i * self.orderExpireInterval);

            // Update x and y with the virtual orders executing in the period between the last
            // execution and the next executingInterval
            (x, y) = _executePeriodOrders(
                self,
                executingInterval,
                uint256(x),
                uint256(y),
                k
            );
        }

        // Update the balances for the period between the last (most recent) executingInterval and
        // the current block
        if (block.number != self.lastExecutedBlock) {
            (x, y) = _executePeriodOrders(
                self,
                block.number,
                uint256(x),
                uint256(y),
                k
            );
        }
    }

    function _executePeriodOrders(
        OrderPools storage self,
        uint256 _executingBlock,
        uint256 _xStart,
        uint256 _yStart,
        uint256 _k
    ) internal returns (uint112 x, uint112 y) {
        // Get the relevant pools
        OrderPool storage pool1 = self.pools[self.tokenX][self.tokenY];
        OrderPool storage pool2 = self.pools[self.tokenY][self.tokenX];

        // Number of blocks between the current executing interval and the most recent execution before
        uint256 numBlocksBetweenIntAndBlock = _executingBlock -
            self.lastExecutedBlock;

        // The sale rates for x and y respectively (after the last execution)
        uint256 xRate = pool1.saleRate;
        uint256 yRate = pool2.saleRate;

        // Total x and y in over current period
        uint256 xInCurr = xRate * numBlocksBetweenIntAndBlock;
        uint256 yInCurr = yRate * numBlocksBetweenIntAndBlock;

        // Ending balances of x and y after computation
        (uint256 xEnd, uint256 yEnd) = computeBalances(
            _xStart,
            _yStart,
            xInCurr,
            yInCurr,
            _k
        );

        // Update the pools info to no longer include virtual orders from this period
        pool1.saleRate -= pool1.expirationByBlockInterval[_executingBlock];
        pool2.saleRate -= pool2.expirationByBlockInterval[_executingBlock];
        self.lastExecutedBlock = _executingBlock;

        x = uint112(xEnd);
        y = uint112(yEnd);
    }

    /// @notice method for creating a time-weighted average virtual order over time
    /// @dev order begins as soon as function is called
    function createVirtualOrder(
        OrderPools storage self,
        address _token1,
        address _token2,
        uint256 _endBlock,
        uint256 _salesRate
    ) internal {
        // update virtual orders status
        // executeVirtualOrders(self, reserves);

        OrderPool storage pool = self.pools[_token1][_token2];

        // argument validation
        require(block.number < _endBlock, "WHALESWAP: start / end order");
        require(
            _salesRate != 0,
            "WHALESWAP: Sales Rate is 0. Try decreasing interval size or the number of intervals"
        );
        require(
            _endBlock % self.orderExpireInterval == 0,
            "WHALESWAP: invalid ending block"
        );

        // increment sales rate immediately
        pool.saleRate += _salesRate;

        // instantiate order
        pool.orders[pool.orderId] = LongTermOrder({
            id: pool.orderId,
            creator: msg.sender,
            beginBlock: block.number,
            finalBlock: _endBlock,
            ratePerBlock: _salesRate,
            active: true
        });

        // set expiration amount
        pool.expirationByBlockInterval[_endBlock] += _salesRate;

        // increment counter
        pool.orderId++;

        emit OrderCreated(pool.orderId - 1, _token1, _token2, msg.sender);
    }

    // TODO: Look at this
    /// @notice cancels an existing, active virtual order by identifier
    // function cancelVirtualOrder(
    //     OrderPools storage self,
    //     uint256 _id,
    //     address _token1,
    //     address _token2
    // ) internal {
    //     // update virtual orders status
    //     // executeVirtualOrders(self, reserves);

    //     // calculate reserve changes
    //     // calculateVirtualReserves()

    //     // fetch proper OrderPool
    //     OrderPool storage pool = self.pools[_token1][_token2];
    //     require(pool.orderId != 0, "WHALESWAP: invalid token pair");

    //     // fetch LongTermOrder by given id
    //     LongTermOrder storage order = pool.orders[_id];
    //     require(order.id != 0, "WHALESWAP: invalid order");
    //     require(
    //         order.finalBlock > block.number,
    //         "WHALESWAP: order already finished"
    //     );
    //     require(order.creator == msg.sender, "WHALESWAP: permission denied");

    //     // decrease current sales rate & old expiring block rate change
    //     pool.saleRate -= order.ratePerBlock;

    //     // remove expiration penalty on expiration interval
    //     pool.expirationByBlockInterval[order.finalBlock] -= order.ratePerBlock;

    //     // mark order inactive
    //     order.active = false;

    //     emit OrderCancelled(_id, _token1, _token2);
    // }

    // TODO: Look at this
    /// @notice withdraw from a completed virtual order
    // function withdrawVirtualOrder(
    //     OrderPools storage self,
    //     address _token1,
    //     address _token2,
    //     uint256 _id
    // ) internal {
    //     // update virtual orders status
    //     // executeVirtualOrders(self, reserves);

    //     // fetch proper OrderPool
    //     OrderPool storage pool = self.pools[_token1][_token2];
    //     require(pool.orderId != 0, "WHALESWAP: invalid token pair");

    //     // fetch LongTermOrder by given id
    //     LongTermOrder storage order = pool.orders[_id];
    //     require(order.id != 0, "WHALESWAP: invalid order id");
    //     require(order.creator == msg.sender, "WHALESWAP: permission denied");
    //     require(
    //         order.finalBlock < block.timestamp,
    //         "WHALESWAP: order still executing"
    //     );

    //     // execute withdraw
    // }

    /// @notice logic for computing TWAMM virtual change in underlying reserves
    function computeBalances(
        uint256 _xStart,
        uint256 _yStart,
        uint256 _xIn,
        uint256 _yIn,
        uint256 _k
    ) private pure returns (uint256 x, uint256 y) {
        if (_xIn == 0 && _yIn == 0) {
            x = _xIn;
            y = _yIn;
        } else if (_xIn == 0) {
            x = _k / (_yStart + _yIn);
            y = _yStart + _yIn;
        } else if (_yIn == 0) {
            x = _xStart + _xIn;
            y = _k / (_xStart + _xIn);
        } else {
            int256 xIn = PRBMathSD59x18.fromInt(int256(_xIn));
            int256 yIn = PRBMathSD59x18.fromInt(int256(_yIn));
            int256 xStart = PRBMathSD59x18.fromInt(int256(_xStart));
            int256 yStart = PRBMathSD59x18.fromInt(int256(_yStart));
            int256 k = PRBMathSD59x18.fromInt(int256(_k));

            int256 con = calculatePoolSizeFormulaConstant(
                xIn,
                yIn,
                xStart,
                yStart
            );
            int256 xEnd = calculateXEnd(xIn, yIn, k, con);
            int256 yEnd = PRBMathSD59x18.div(k, xEnd);
            return (uint256(xEnd), uint256(yEnd));
        }
    }

    function calculatePoolSizeFormulaConstant(
        int256 _xIn,
        int256 _yIn,
        int256 _xStart,
        int256 _yStart
    ) private pure returns (int256 c) {
        int256 xStartYIn = PRBMathSD59x18.sqrt(
            PRBMathSD59x18.mul(_xStart, _yIn)
        );
        int256 yStartXIn = PRBMathSD59x18.sqrt(
            PRBMathSD59x18.mul(_xIn, _yStart)
        );
        int256 num = xStartYIn - yStartXIn;
        int256 denom = yStartXIn - xStartYIn;
        c = PRBMathSD59x18.div(num, denom);
    }

    function calculateXEnd(
        int256 _xIn,
        int256 _yIn,
        int256 _k,
        int256 _c
    ) private pure returns (int256 xEnd) {
        int256 expNum = PRBMathSD59x18.sqrt(
            PRBMathSD59x18.mul(
                PRBMathSD59x18.mul(PRBMathSD59x18.fromInt(4), _xIn),
                _yIn
            )
        );
        int256 expDenom = PRBMathSD59x18.inv(PRBMathSD59x18.sqrt(_k));
        int256 exp = PRBMathSD59x18.exp(PRBMathSD59x18.mul(expNum, expDenom));
        int256 rightSide = PRBMathSD59x18.div((exp + _c), (exp - _c));
        int256 leftSide = PRBMathSD59x18.mul(
            PRBMathSD59x18.sqrt(PRBMathSD59x18.div(_k, _yIn)),
            (PRBMathSD59x18.sqrt(_xIn))
        );
        xEnd = PRBMathSD59x18.mul(rightSide, leftSide);
    }
}
