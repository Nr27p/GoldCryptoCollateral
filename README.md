Step 1 do npm i
step 2 touch .env file
step 3 enter 4 to 5 in .env file 
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=enteryourprivatekey (metamask)
step 4 npx hardhat compile
step 5 npx hardhat run scripts/deploy.js --network sepolia
