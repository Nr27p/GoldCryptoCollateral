async function main() {
    // Deploy GoldToken contract
    const GoldToken = await ethers.getContractFactory("GoldToken");
    const goldToken = await GoldToken.deploy(ethers.utils.parseEther("1000")); // Mint 1000 GOLD tokens initially
    await goldToken.deployed();
    console.log("GoldToken deployed to:", goldToken.address);
  
    // Deploy LoanContract with the address of the GoldToken
    const LoanContract = await ethers.getContractFactory("LoanContract");
    const loanContract = await LoanContract.deploy(goldToken.address);
    await loanContract.deployed();
    console.log("LoanContract deployed to:", loanContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  