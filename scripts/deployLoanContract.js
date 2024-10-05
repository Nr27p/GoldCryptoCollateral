// deployLoanContract.js

async function main() {
    // Get the GoldToken address (ensure this is the correct address)
    const goldTokenAddress = "0x60aaa1F8fBaa9ed42Cb720789E32d464529159Fb"; // Replace with actual GoldToken address

    // Get the LoanContract factory
    const LoanContract = await ethers.getContractFactory("LoanContract");

    // Estimate gas for deployment
    const estimatedGas = await LoanContract.signer.estimateGas(LoanContract.getDeployTransaction(goldTokenAddress));
    const gasPrice = await ethers.provider.getGasPrice();
    const totalCost = estimatedGas.mul(gasPrice);

    console.log(`Estimated Gas: ${estimatedGas.toString()}`);
    console.log(`Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
    console.log(`Total Estimated Cost in Sepolia ETH: ${ethers.utils.formatEther(totalCost)} ETH`);

    // Prompt for confirmation
    const userConfirmed = await promptUserConfirmation();

    if (userConfirmed) {
        // Proceed with deployment
        const loanContract = await LoanContract.deploy(goldTokenAddress);
        await loanContract.deployed();
        console.log("LoanContract deployed to:", loanContract.address);
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
