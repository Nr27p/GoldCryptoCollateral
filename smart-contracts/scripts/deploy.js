const hre = require("hardhat");

async function main() {
  // Get the ethers object
  const { ethers } = hre;
  
  // Deploy GoldToken
  const GoldToken = await ethers.getContractFactory("GoldToken");
  // In ethers v6, parseEther is a standalone function
  const initialSupply = ethers.parseEther("1000"); // 1000 tokens
  const goldToken = await GoldToken.deploy(initialSupply);
  
  // Wait for the deployment
  await goldToken.waitForDeployment();
  // In v6, we get the address differently
  console.log("GoldToken deployed to:", await goldToken.getAddress());
  
  // Deploy LoanContract
  const LoanContract = await ethers.getContractFactory("LoanContract");
  const loanContract = await LoanContract.deploy(await goldToken.getAddress());
  
  // Wait for the deployment
  await loanContract.waitForDeployment();
  console.log("LoanContract deployed to:", await loanContract.getAddress());
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exit(1);
});