const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GoldToken and LoanContract Tests", function () {
  let goldToken, loanContract, owner, lender, borrower;

  beforeEach(async function () {
    [owner, lender, borrower] = await ethers.getSigners();

    // Deploy the GoldToken with an initial supply of 1,000,000
    const GoldToken = await ethers.getContractFactory("GoldToken");
    const initialSupply = ethers.utils.parseEther("1000000"); // Corrected to ethers.utils.parseEther
    goldToken = await GoldToken.deploy(initialSupply);
    await goldToken.deployed();

    // Deploy the LoanContract and pass the GoldToken's address
    const LoanContract = await ethers.getContractFactory("LoanContract");
    loanContract = await LoanContract.deploy(goldToken.address);
    await loanContract.deployed();

    // Transfer some GoldToken to the borrower for collateral
    await goldToken.connect(owner).transfer(borrower.address, ethers.utils.parseEther("5000"));
  });

  it("Should allow owner to mint new tokens", async function () {
    await goldToken.connect(owner).mint(ethers.utils.parseEther("1000"));
    expect(await goldToken.totalSupply()).to.equal(ethers.utils.parseEther("1001000"));
  });

  it("Should not allow non-owner to mint tokens", async function () {
    await expect(goldToken.connect(borrower).mint(ethers.utils.parseEther("1000"))).to.be.revertedWith("Only the owner can perform this action");
  });

  it("Should allow a borrower to request a loan", async function () {
    const collateralAmount = ethers.utils.parseEther("1000");
    const interestRate = 10; // 10%

    // Approve the LoanContract to spend borrower's GoldToken as collateral
    await goldToken.connect(borrower).approve(loanContract.address, collateralAmount);

    // Borrower requests loan
    await loanContract.connect(borrower).requestLoan(lender.address, collateralAmount, interestRate);

    const loan = await loanContract.loans(borrower.address);

    // Validate loan data
    expect(loan.principal).to.equal(collateralAmount);
    expect(loan.collateral).to.equal(collateralAmount);
    expect(loan.interestRate).to.equal(interestRate);
    expect(loan.totalDebt).to.equal(collateralAmount.mul(110).div(100)); // 1000 + 10% interest
    expect(loan.lender).to.equal(lender.address);
    expect(loan.borrower).to.equal(borrower.address);
    expect(loan.repaid).to.equal(false);
  });

  it("Should allow a borrower to repay a loan", async function () {
    const collateralAmount = ethers.utils.parseEther("1000");
    const interestRate = 10;

    // Approve and request a loan
    await goldToken.connect(borrower).approve(loanContract.address, collateralAmount);
    await loanContract.connect(borrower).requestLoan(lender.address, collateralAmount, interestRate);

    const totalDebt = collateralAmount.mul(110).div(100); // 1000 + 10% interest

    // Borrower repays the loan
    await loanContract.connect(borrower).repayLoan({ value: totalDebt });

    // Check if the loan is marked as repaid
    const loan = await loanContract.loans(borrower.address);
    expect(loan.repaid).to.equal(true);
    expect(await goldToken.balanceOf(borrower.address)).to.equal(ethers.utils.parseEther("5000")); // Initial collateral is returned
  });

  it("Should prevent a non-lender from liquidating a loan", async function () {
    const collateralAmount = ethers.utils.parseEther("1000");
    const interestRate = 10;

    // Approve and request a loan
    await goldToken.connect(borrower).approve(loanContract.address, collateralAmount);
    await loanContract.connect(borrower).requestLoan(lender.address, collateralAmount, interestRate);

    // Attempt liquidation by a non-lender
    await expect(loanContract.connect(borrower).liquidateLoan(borrower.address)).to.be.revertedWith("Only the lender can liquidate");
  });

  it("Should allow the lender to liquidate an unpaid loan", async function () {
    const collateralAmount = ethers.utils.parseEther("1000");
    const interestRate = 10;

    // Approve and request a loan
    await goldToken.connect(borrower).approve(loanContract.address, collateralAmount);
    await loanContract.connect(borrower).requestLoan(lender.address, collateralAmount, interestRate);

    // Lender liquidates the loan
    await loanContract.connect(lender).liquidateLoan(borrower.address);

    // Verify the loan is deleted and collateral transferred to lender
    const loan = await loanContract.loans(borrower.address);
    expect(loan.principal).to.equal(0); // Loan deleted
    expect(await goldToken.balanceOf(lender.address)).to.equal(collateralAmount); // Lender receives collateral
  });
});
