// src/utils/contracts.js
import { ethers, Contract } from "ethers";
import GoldTokenABI from "./GoldToken.json";
import LoanContractABI from "./LoanContract.json";

const GOLD_TOKEN_ADDRESS = process.env.REACT_APP_GOLD_TOKEN_ADDRESS; // Note the REACT_APP_ prefix
const LOAN_CONTRACT_ADDRESS = process.env.REACT_APP_LOAN_CONTRACT_ADDRESS;

export function getGoldTokenContract(signer) {
  if (!GOLD_TOKEN_ADDRESS) {
    throw new Error("Gold Token contract address not configured");
  }
  return new Contract(GOLD_TOKEN_ADDRESS, GoldTokenABI, signer);
}

export function getLoanContract(signer) {
  if (!LOAN_CONTRACT_ADDRESS) {
    throw new Error("Loan contract address not configured");
  }
  return new Contract(LOAN_CONTRACT_ADDRESS, LoanContractABI, signer);
}

export async function buyGoldToken(signer, amount) {
  try {
    const goldToken = getGoldTokenContract(signer);
    // First approve the transaction
    const tx = await goldToken.mint(amount);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error in buyGoldToken:", error);
    throw error;
  }
}

export async function requestLoan(signer, collateralAmount) {
  try {
    const loanContract = getLoanContract(signer);
    const goldToken = getGoldTokenContract(signer);
    
    // First approve the loan contract to spend tokens
    const approveTx = await goldToken.approve(LOAN_CONTRACT_ADDRESS, collateralAmount);
    await approveTx.wait();
    
    // Then request the loan
    const tx = await loanContract.requestLoan(collateralAmount, {
      value: collateralAmount
    });
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error in requestLoan:", error);
    throw error;
  }
}