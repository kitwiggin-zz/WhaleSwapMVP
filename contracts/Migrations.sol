// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Pretty sure this is no longer used because i commented out deploy migrations
// in initial_migration.js

contract Migrations {
    address public owner = msg.sender;
    uint256 public last_completed_migration;

    modifier restricted() {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
        );
        _;
    }

    function setCompleted(uint256 completed) public restricted {
        last_completed_migration = completed;
    }
}
