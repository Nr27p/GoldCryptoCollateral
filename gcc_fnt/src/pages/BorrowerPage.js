// src/BorrowerPage.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LoanContractABI from "../utils/LoanContract.json";
import GoldTokenABI from "../utils/GoldToken.json";

const loanContractAddress = "0x60d0A60c37B2a60C23bD215Ab55b9a211519a89e";
const goldTokenAddress = "0x1c0d81e949251529bb29dca12b7fca78cF5ba896";

const BorrowerPage = () => {
    const [account, setAccount] = useState('');
    const [loanOffers, setLoanOffers] = useState([]);
    const [collateralAmount, setCollateralAmount] = useState('');
    const [borrowerLoans, setBorrowerLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loanContract, setLoanContract] = useState(null);
    const [goldTokenContract, setGoldTokenContract] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountChange);
            window.ethereum.on('chainChanged', () => window.location.reload());
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountChange);
            }
        };
    }, []);

    useEffect(() => {
        if (account) {
            fetchLoanOffers();
            fetchBorrowerLoans();
        }
    }, [account]);

    const handleAccountChange = async (accounts) => {
        if (accounts.length === 0) {
            setAccount('');
        } else {
            setAccount(accounts[0]);
        }
    };

    const connectWallet = async () => {
        setError('');
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Please install MetaMask!');
            }

            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();
            const loanContractInstance = new ethers.Contract(loanContractAddress, LoanContractABI.abi, signer);
            const goldTokenContractInstance = new ethers.Contract(goldTokenAddress, GoldTokenABI.abi, signer);

            setAccount(accounts[0]);
            setLoanContract(loanContractInstance);
            setGoldTokenContract(goldTokenContractInstance);

            fetchLoanOffers();
            fetchBorrowerLoans();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoanOffers = async () => {
        if (loanContract) {
            const offers = await loanContract.getLoanOffers();
            const availableOffers = offers.filter(offer => offer.ethAmount > 0);
            setLoanOffers(availableOffers);
        }
    };

    const fetchBorrowerLoans = async () => {
        if (loanContract && account) {
            const loans = await loanContract.getBorrowerLoanHistory(account);
            setBorrowerLoans(loans);
        }
    };

    const takeLoan = async (index, ethAmount) => {
        if (!loanContract || !goldTokenContract || !collateralAmount) return;
        setError('');
        setLoading(true);
      
        try {
          // Convert ethAmount to string if it isn't already
          const ethAmountStr = ethers.formatEther(ethAmount);
      
          // Calculate the required collateral based on the ETH amount
          const goldTokensRequired = calculateCollateral(ethAmount);
          const collateralInWei = ethers.parseUnits(goldTokensRequired, 18);
      
          // Approve loan contract to spend GOLD tokens
          const approveTx = await goldTokenContract.approve(loanContractAddress, collateralInWei);
          await approveTx.wait(); // Wait for approval to be confirmed
      
          // Taking the loan
          const loanTx = await loanContract.takeLoan(index, {
            value: ethers.parseEther(ethAmountStr),
            gasLimit: 1500000, // Increase gas limit
            gasPrice: 20e9 // Increase gas price
          });
          const receipt = await loanTx.wait(); // Wait for loan transaction to be confirmed
      
          if (receipt.status === 0) {
            // Transaction failed, get the revert reason
            const revertReason = await loanContract.callStatic.takeLoan(index, {
              value: ethers.parseEther(ethAmountStr),
              gasLimit: 1500000,
              gasPrice: 20e9
            });
            console.log('Revert reason:', revertReason);
            setError(`Error taking loan: ${revertReason}`);
          } else {
            fetchLoanOffers();
            fetchBorrowerLoans();
          }
        } catch (err) {
          console.error("Error taking loan: ", err);
          setError(err.message || "An error occurred while taking the loan.");
        } finally {
          setLoading(false);
        }
      };

    // Updated calculateCollateral to return a string
    const calculateCollateral = (ethAmount) => {
        const goldTokensPerEth = 1000; // Example: 1 ETH = 1000 GOLD tokens
        const requiredTokens = (ethers.formatUnits(ethAmount, 'ether') * goldTokensPerEth).toFixed(0);
        return requiredTokens.toString(); // Return as string
    };
    

    const repayLoan = async (index, repaymentAmount) => {
        if (!loanContract) return;
        setError('');
        setLoading(true);

        try {
            const repayTx = await loanContract.repayLoan(index, { value: ethers.parseEther(repaymentAmount) });
            await repayTx.wait();

            fetchBorrowerLoans();
            fetchLoanOffers();
        } catch (err) {
            console.error("Error repaying loan: ", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                {!account ? (
                                    <button
                                        onClick={connectWallet}
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Connecting...' : 'Connect Wallet'}
                                    </button>
                                ) : (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Connected Account:</p>
                                        <p className="font-mono">{`${account.substring(0, 6)}...${account.substring(38)}`}</p>
                                    </div>
                                )}

                                {account && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Loan Offers Available:</p>
                                        <ul className="space-y-2">
                                            {loanOffers.map((offer, index) => (
                                                <li key={index} className="bg-gray-100 rounded-md p-4">
                                                    <p>ETH Amount: {ethers.formatEther(offer.ethAmount)} ETH</p>
                                                    <p>Interest Rate: {offer.interestRate}%</p>
                                                    <p>Days to Repay: {offer.daysToRepay}</p>
                                                    <input
                                                        type="number"
                                                        value={collateralAmount}
                                                        onChange={(e) => setCollateralAmount(e.target.value)}
                                                        placeholder="Collateral in Gold Tokens"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                                    />
                                                    <button
                                                        onClick={() => takeLoan(index, offer.ethAmount)}
                                                        disabled={loading || !collateralAmount}
                                                        className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                                    >
                                                        {loading ? 'Processing...' : 'Take Loan'}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {account && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Your Loans:</p>
                                        <ul className="space-y-2">
                                            {borrowerLoans.map((loan, index) => (
                                                <li key={index} className="bg-gray-100 rounded-md p-4">
                                                    <p>Loan Amount: {ethers.formatEther(loan.ethAmount)} ETH</p>
                                                    <p>Interest: {loan.interest}</p>
                                                    <p>Repay By: {new Date(loan.repayBy * 1000).toLocaleDateString()}</p>
                                                    <p>Status: {loan.isRepaid ? "Repaid" : "Active"}</p>
                                                    {!loan.isRepaid && (
                                                        <button
                                                            onClick={() => repayLoan(index, loan.ethAmount + loan.interest)}
                                                            disabled={loading}
                                                            className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                                        >
                                                            {loading ? 'Processing...' : 'Repay Loan'}
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 text-red-500">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BorrowerPage;
