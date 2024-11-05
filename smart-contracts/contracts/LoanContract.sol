// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LoanContract {
    IERC20 public goldToken;
    address public owner;
    uint256 public constant collateralRate = 100; // 100 GoldToken for 0.1 ETH (or 1000 GoldToken for 1 ETH)
    
    struct LoanOffer {
        address lender;
        uint256 ethAmount;
        uint256 interestRate; // in percentage
        uint256 daysToRepay;
        bool isTaken;
    }

    struct Loan {
        address borrower;
        uint256 ethAmount;
        uint256 interest;
        uint256 collateralAmount;
        uint256 startTime;
        uint256 repayBy;
        bool isRepaid;
    }

    LoanOffer[] public loanOffers;
    mapping(address => Loan[]) public borrowerLoans;

    event LoanOfferCreated(address lender, uint256 ethAmount, uint256 interestRate, uint256 daysToRepay);
    event LoanTaken(address borrower, uint256 loanIndex, uint256 ethAmount, uint256 collateralAmount);
    event LoanRepaid(address borrower, uint256 loanIndex, uint256 repaymentAmount);
    event LoanDefaulted(address lender, uint256 loanIndex, uint256 collateralAmount);
    event LoanOfferCancelled(address lender, uint256 loanIndex);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(address _goldToken) {
        goldToken = IERC20(_goldToken);
        owner = msg.sender;
    }

    // Function for lenders to create a loan offer
    function createLoanOffer(uint256 ethAmount, uint256 interestRate, uint256 daysToRepay) external payable {
        require(msg.value == ethAmount, "Incorrect ETH amount sent");
        require(ethAmount > 0, "ETH amount must be greater than zero");

        loanOffers.push(LoanOffer({
            lender: msg.sender,
            ethAmount: ethAmount,
            interestRate: interestRate,
            daysToRepay: daysToRepay,
            isTaken: false
        }));

        emit LoanOfferCreated(msg.sender, ethAmount, interestRate, daysToRepay);
    }

    // Function for lenders to cancel their loan offer
    function cancelLoanOffer(uint256 offerIndex) external {
        LoanOffer storage offer = loanOffers[offerIndex];
        require(offer.lender == msg.sender, "Only lender can cancel their offer");
        require(!offer.isTaken, "Loan offer already taken");

        uint256 ethAmount = offer.ethAmount;
        offer.ethAmount = 0;
        offer.isTaken = true; // Mark as taken to prevent re-use

        payable(msg.sender).transfer(ethAmount);
        emit LoanOfferCancelled(msg.sender, offerIndex);
    }

    // Function for borrowers to take a loan by providing collateral
    function takeLoan(uint256 offerIndex) external {
        LoanOffer storage offer = loanOffers[offerIndex];
        require(!offer.isTaken, "Loan offer already taken");

        uint256 collateralAmount = (offer.ethAmount * collateralRate) / 10; // 0.1 ETH -> 100 GoldToken
        require(goldToken.balanceOf(msg.sender) >= collateralAmount, "Insufficient GoldToken for collateral");

        offer.isTaken = true;

        // Transfer collateral from borrower to contract
        require(goldToken.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        uint256 interest = (offer.ethAmount * offer.interestRate) / 100;

        // Record loan in borrower history
        borrowerLoans[msg.sender].push(Loan({
            borrower: msg.sender,
            ethAmount: offer.ethAmount,
            interest: interest,
            collateralAmount: collateralAmount,
            startTime: block.timestamp,
            repayBy: block.timestamp + (offer.daysToRepay * 1 days),
            isRepaid: false
        }));

        // Transfer loan ETH amount to borrower
        payable(msg.sender).transfer(offer.ethAmount);

        emit LoanTaken(msg.sender, offerIndex, offer.ethAmount, collateralAmount);
    }

    // Function for borrowers to repay a loan
    function repayLoan(uint256 loanIndex) external payable {
        Loan storage loan = borrowerLoans[msg.sender][loanIndex];
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp <= loan.repayBy, "Loan repayment deadline has passed");

        uint256 totalRepayment = loan.ethAmount + loan.interest;
        require(msg.value == totalRepayment, "Incorrect repayment amount");

        loan.isRepaid = true;

        // Transfer ETH repayment to lender
        LoanOffer storage offer = loanOffers[loanIndex];
        payable(offer.lender).transfer(msg.value);

        // Return collateral to borrower
        require(goldToken.transfer(msg.sender, loan.collateralAmount), "Collateral return failed");

        emit LoanRepaid(msg.sender, loanIndex, totalRepayment);
    }

    // Function to allow lender to claim collateral if borrower defaults
    function claimCollateral(uint256 loanIndex) external {
        Loan storage loan = borrowerLoans[msg.sender][loanIndex];
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp > loan.repayBy, "Loan is still in repayment period");

        // Transfer collateral to lender
        LoanOffer storage offer = loanOffers[loanIndex];
        require(goldToken.transfer(offer.lender, loan.collateralAmount), "Collateral transfer to lender failed");

        loan.isRepaid = true; // Mark as settled
        emit LoanDefaulted(offer.lender, loanIndex, loan.collateralAmount);
    }

    // Function to check the amount left to repay
    function amountLeftToRepay(address borrower, uint256 loanIndex) external view returns (uint256) {
        Loan storage loan = borrowerLoans[borrower][loanIndex];
        if (loan.isRepaid) {
            return 0;
        }
        return loan.ethAmount + loan.interest;
    }

    // Function to view all loan offers
    function getLoanOffers() external view returns (LoanOffer[] memory) {
        return loanOffers;
    }

    // Function to view borrower's loan history
    function getBorrowerLoanHistory(address borrower) external view returns (Loan[] memory) {
        return borrowerLoans[borrower];
    }
}
