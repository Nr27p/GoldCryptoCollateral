// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GoldToken is ERC20 {
    address public owner;                 // Owner of the contract
    uint256 public exchangeRate;          // Number of GoldToken per ETH

    // Event for ETH to GoldToken purchase
    event TokensPurchased(address buyer, uint256 ethAmount, uint256 tokenAmount);

    // Constructor initializes the token name, symbol, initial supply, and exchange rate
    constructor(uint256 initialSupply, uint256 _exchangeRate) ERC20("GoldToken", "GOLD") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
        exchangeRate = _exchangeRate; // Set initial exchange rate, e.g., 1 ETH = 1000 GoldToken
    }

    // Modifier to allow only owner to execute certain functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to buy GoldToken with ETH
    function buyGoldToken() external payable {
        require(msg.value > 0, "You must send some ETH to buy tokens");

        // Calculate the amount of GoldToken to transfer based on the exchange rate
        uint256 tokenAmount = msg.value * exchangeRate;

        // Ensure the contract has enough GoldToken for the transaction
        require(balanceOf(address(this)) >= tokenAmount, "Insufficient GoldToken balance in contract");

        // Transfer GoldToken from the contract to the buyer
        _transfer(address(this), msg.sender, tokenAmount);

        // Emit event for logging
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    // Function to allow owner to withdraw collected ETH from sales
    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Function to allow owner to adjust the exchange rate
    function setExchangeRate(uint256 newRate) external onlyOwner {
        exchangeRate = newRate;
    }

    // Fallback function to receive ETH directly
    receive() external payable {}
}
