// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GoldToken is ERC20 {
    address public owner;

    constructor(uint256 initialSupply) ERC20("GoldToken", "GOLD") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    // Function to mint new tokens, only the owner can call this
    function mint(uint256 amount) public {
        require(msg.sender == owner, "Only the owner can mint tokens");
        _mint(msg.sender, amount);
    }
}
