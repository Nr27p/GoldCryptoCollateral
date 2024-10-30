// Specifies the license identifier for this Solidity code
// SPDX-License-Identifier: MIT

// Defines the Solidity version to be used
pragma solidity ^0.8.0;

// Imports the IERC20 interface from the OpenZeppelin library
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Defines a new contract called LoanContract
contract LoanContract {
    // Declares a public IERC20 variable called "goldToken" to interact with the GoldToken contract
    IERC20 public goldToken;
    // Declares a public address variable called "owner" to store the contract owner's address
    address public owner;

    // Defines a struct called "Loan" to store loan-related information
    struct Loan {
        uint256 principal;
        uint256 collateral;
        uint256 interestRate;
        uint256 totalDebt;
        address lender;
        address borrower;
        bool repaid;
    }

    // Defines a mapping called "loans" to store loan information for each borrower
    mapping(address => Loan) public loans;

    // Constructor function that is called when the contract is deployed
    // It takes the address of the GoldToken contract as a parameter
    constructor(IERC20 _goldToken) {
        // Stores the GoldToken contract address in the "goldToken" variable
        goldToken = _goldToken;
        // Sets the contract owner to the address that deployed the contract
        owner = msg.sender;
    }

    // Function that allows a user to request a loan from a specific lender
    function requestLoan(address lender, uint256 collateralAmount, uint256 interestRate) external payable {
        // Ensures the user doesn't already have an active loan
        require(loans[msg.sender].principal == 0, "Loan already taken");
        // Transfers the collateral amount from the borrower to the lender
        require(goldToken.transferFrom(msg.sender, lender, collateralAmount), "Collateral transfer failed");
        
        // Calculates the total debt, including the interest
        uint256 totalDebt = collateralAmount + (collateralAmount * interestRate / 100);

        // Stores the loan details in the "loans" mapping
        loans[msg.sender] = Loan({
            principal: collateralAmount,
            collateral: collateralAmount,
            interestRate: interestRate,
            totalDebt: totalDebt,
            lender: lender,
            borrower: msg.sender,
            repaid: false
        });

        // Transfers the loan amount to the borrower
        payable(msg.sender).transfer(collateralAmount);
    }

    // Function that allows a borrower to repay their loan and reclaim their collateral
    function repayLoan() external payable {
        // Retrieves the loan details for the caller
        Loan storage loan = loans[msg.sender];
        // Ensures the borrower has an active loan
        require(loan.principal > 0, "No active loan");
        // Ensures the loan hasn't been repaid yet
        require(!loan.repaid, "Loan already repaid");
        // Ensures the repayment amount is correct
        require(msg.value == loan.totalDebt, "Incorrect repayment amount");

        // Marks the loan as repaid
        loan.repaid = true;
        // Transfers the collateral back to the borrower
        require(goldToken.transferFrom(loan.lender, loan.borrower, loan.collateral), "Collateral return failed");
        // Transfers the repayment amount to the lender
        payable(loan.lender).transfer(msg.value);
    }

    // Function that allows a user to check the remaining debt for a specific borrower
    function remainingDebt(address borrower) external view returns (uint256) {
        // Retrieves the loan details for the specified borrower
        Loan storage loan = loans[borrower];
        // Ensures the borrower has an active loan
        require(loan.principal > 0, "No active loan for this borrower");
        // Ensures the loan hasn't been repaid yet
        require(!loan.repaid, "Loan already repaid");
        // Returns the remaining debt
        return loan.totalDebt;
    }

    // Function that allows a lender to liquidate an unpaid loan
    function liquidateLoan(address borrower) external {
        // Retrieves the loan details for the specified borrower
        Loan storage loan = loans[borrower];
        // Ensures the caller is the lender for this loan
        require(msg.sender == loan.lender, "Only the lender can liquidate");
        // Ensures the loan hasn't been repaid yet
        require(!loan.repaid, "Loan already repaid");

        // Transfers the collateral to the lender
        require(goldToken.transfer(loan.lender, loan.collateral), "Collateral transfer failed");
        // Deletes the loan record from the "loans" mapping
        delete loans[borrower];
    }

    // Allows the contract to receive Ether
    receive() external payable {}
}