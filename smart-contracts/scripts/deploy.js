const { ethers } = require("hardhat");

async function main() {
  try {
    // Configuration
    const initialSupply = ethers.parseEther("1000000"); // 1 million tokens
    const initialExchangeRate = 1000; // 1 ETH = 1000 GOLD tokens
    
    // Deploy contract
    console.log("Deploying GoldToken contract...");
    const GoldToken = await ethers.getContractFactory("GoldToken");
    const goldToken = await GoldToken.deploy(initialSupply, initialExchangeRate);
    
    // Wait for deployment to complete
    await goldToken.waitForDeployment();
    const goldTokenAddress = await goldToken.getAddress();
    
    console.log(`GoldToken deployed to: ${goldTokenAddress}`);
    
    // Wait for 6 block confirmations
    console.log("Waiting for block confirmations...");
    await goldToken.deploymentTransaction().wait(6);
    
    // Verify contract
    console.log("Verifying contract on Etherscan...");
    await verify(goldTokenAddress, [initialSupply, initialExchangeRate]);
    
    // Initial setup
    const [deployer] = await ethers.getSigners();
    
    // Transfer some tokens to the contract for selling
    console.log("Transferring tokens to contract...");
    const transferAmount = ethers.parseEther("500000"); // Transfer 500k tokens to contract
    const transferTx = await goldToken.transfer(goldTokenAddress, transferAmount);
    await transferTx.wait(1); // Wait for transfer transaction to be mined
    
    console.log("Initial setup complete!");
    console.log(`Total supply: ${await goldToken.totalSupply()} GOLD`);
    console.log(`Contract balance: ${await goldToken.balanceOf(goldTokenAddress)} GOLD`);
    console.log(`Owner balance: ${await goldToken.balanceOf(deployer.address)} GOLD`);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

async function verify(contractAddress, args) {
  console.log("Verifying contract...");
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