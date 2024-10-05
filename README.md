# Step need to do
- ## Step 1:- do npm i
- ## step 2:- touch .env file
- ## step 3:- enter below in .env file 
- #### SEPOLIA_RPC_URL=https://rpc.sepolia.org
- #### PRIVATE_KEY=enteryourprivatekey (metamask)
- ## step 4:- npx hardhat compile
- ## step 5:-
- #### npx hardhat run scripts/deployGoldToken.js --network sepolia  (To deploy gold token)
- #### npx hardhat run scripts/deployLoanContract.js --network sepolia  (To deploy loan contract)
