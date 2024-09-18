// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LoanContract {
    IERC20 public goldToken;
    address public owner;

    struct Loan {
        uint256 amount;
        uint256 collateral;
        address borrower;
        bool repaid;
    }

    mapping(address => Loan) public loans;

    constructor(IERC20 _goldToken) {
        goldToken = _goldToken;
        owner = msg.sender;
    }

    // Borrow ETH by depositing GoldToken as collateral
    function requestLoan(uint256 collateralAmount) external payable {
        require(loans[msg.sender].amount == 0, "Loan already taken");
        require(goldToken.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");
        
        // Issue loan (for simplicity, loan amount is equal to collateral value)
        loans[msg.sender] = Loan({
            amount: collateralAmount,
            collateral: collateralAmount,
            borrower: msg.sender,
            repaid: false
        });

        // Transfer ETH to the borrower
        payable(msg.sender).transfer(collateralAmount);
    }

    // Repay the loan and reclaim collateral
    function repayLoan() external payable {
        Loan storage loan = loans[msg.sender];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid, "Loan already repaid");
        require(msg.value == loan.amount, "Incorrect repayment amount");

        // Mark loan as repaid
        loan.repaid = true;

        // Transfer collateral back to borrower
        require(goldToken.transfer(msg.sender, loan.collateral), "Collateral return failed");
    }

    // Liquidate the loan if not repaid (for simplicity, manual call by owner)
    function liquidateLoan(address borrower) external {
        require(msg.sender == owner, "Only owner can liquidate");
        Loan storage loan = loans[borrower];
        require(!loan.repaid, "Loan already repaid");

        // Transfer collateral to the owner (lender)
        require(goldToken.transfer(owner, loan.collateral), "Collateral transfer failed");

        // Delete the loan
        delete loans[borrower];
    }

    // Allow the contract to receive ETH
    receive() external payable {}
}
