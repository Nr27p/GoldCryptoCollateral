// deployGoldToken.js

async function main() {
    // Get the GoldToken contract factory
    const GoldToken = await ethers.getContractFactory("GoldToken");

    // Estimate gas for deployment
    const estimatedGas = await GoldToken.signer.estimateGas(GoldToken.getDeployTransaction(ethers.utils.parseEther("127")));
    const gasPrice = await ethers.provider.getGasPrice();
    const totalCost = estimatedGas.mul(gasPrice);

    console.log(`Estimated Gas: ${estimatedGas.toString()}`);
    console.log(`Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
    console.log(`Total Estimated Cost in Sepolia ETH: ${ethers.utils.formatEther(totalCost)} ETH`);

    // Prompt for confirmation
    const userConfirmed = await promptUserConfirmation();

    if (userConfirmed) {
        // Proceed with deployment
        const goldToken = await GoldToken.deploy(ethers.utils.parseEther("127"));
        await goldToken.deployed();
        console.log("GoldToken deployed to:", goldToken.address);
    } else {
        console.log("Deployment cancelled.");
    }
}

async function promptUserConfirmation() {
    // This function will prompt for user confirmation
    const readline = require('readline').promises;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await rl.question('Do you want to proceed with the deployment? (yes/no): ');
    rl.close();
    
    return answer.toLowerCase() === 'yes';
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
