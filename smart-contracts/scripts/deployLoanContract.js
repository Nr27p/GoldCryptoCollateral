// deploy.js
const { ethers } = require("hardhat");

async function main() {
  try {
    // Deploy LoanContract
    console.log("Deploying LoanContract...");
    const LoanContract = await ethers.getContractFactory("LoanContract");
    const loanContract = await LoanContract.deploy("0x1c0d81e949251529bb29dca12b7fca78cF5ba896");
    await loanContract.deployed();

    console.log("LoanContract deployed to:", loanContract.address);

    // Wait for 2 minutes before verifying the contract
    console.log("Waiting for 2 minutes before verifying the contract...");
    await new Promise((resolve) => setTimeout(resolve, 120000)); // 2 minutes

    // Verify LoanContract on Etherscan
    console.log("Verifying LoanContract on Etherscan...");
    await verifyContract(loanContract.address, ["0x1c0d81e949251529bb29dca12b7fca78cF5ba896"]);

    console.log("Deployment and verification complete!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

async function verifyContract(contractAddress, args) {
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified!");
    } else {
      console.log("Verification failed:", e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });