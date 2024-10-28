// src/App.js

import React, { useState } from "react";
import { connectWallet } from "../utils/connectWallet";
import { buyGoldToken, requestLoan } from "../utils/contracts";
import { ethers } from "ethers";
import { parseUnits, parseEther } from "ethers";

const GoldLoan = () =>{
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");

  const handleConnectWallet = async () => {
    try {
      const walletData = await connectWallet();
      if (walletData) {
        setWalletAddress(walletData.address);
        setSigner(walletData.signer);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  
  const handleBuyTokens = async () => {
    if (!signer || !tokenAmount) {
      alert("Please connect wallet and enter amount");
      return;
    }
    try {
      const tx = await buyGoldToken(signer, parseUnits(tokenAmount, 18));
      alert("Transaction successful!");
    } catch (error) {
      alert("Transaction failed: " + error.message);
    }
  };
  
  const handleRequestLoan = async () => {
    if (signer && collateralAmount) {
      try {
        const tx = await requestLoan(signer, parseEther(collateralAmount)); // Updated to use parseEther directly
        console.log("Loan requested successfully:", tx);
      } catch (error) {
        console.error("Failed to request loan:", error);
      }
    }
  };
  

  return (
    <div className="App">
      <h1>Gold Token DApp</h1>

      {!walletAddress ? (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected as: {walletAddress}</p>
      )}

      <div>
        <h2>Buy Gold Token</h2>
        <input
          type="text"
          placeholder="Amount of tokens"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
        />
        <button onClick={handleBuyTokens}>Buy Tokens</button>
      </div>

      <div>
        <h2>Request Loan</h2>
        <input
          type="text"
          placeholder="Collateral in ETH"
          value={collateralAmount}
          onChange={(e) => setCollateralAmount(e.target.value)}
        />
        <button onClick={handleRequestLoan}>Request Loan</button>
      </div>
    </div>
  );
}

export default GoldLoan;
