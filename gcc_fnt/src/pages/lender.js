import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import GoldTokenABI from "../utils/GoldToken.json";
import GoldTokenLoanABI from "../utils/GoldTokenLoan.json";

const goldTokenABI = GoldTokenABI.abi;
const goldTokenLoanABI = GoldTokenLoanABI.abi;

const GOLD_TOKEN_ADDRESS = "0x1c0d81e949251529bb29dca12b7fca78cF5ba896";
const LOAN_CONTRACT_ADDRESS = "0xEAFCd51BBB36fF7a286D76A942eDdb9F3a1dBe9e";

const LenderDashboard = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [ethBalance, setEthBalance] = useState("0");
  const [goldBalance, setGoldBalance] = useState("0");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");
  const [activeOffers, setActiveOffers] = useState([]);
  const [pastOffers, setPastOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Connect to the wallet using MetaMask
  const connectWallet = useCallback(async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(provider);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, []);

  // Update account balances for ETH and Gold Token
  const updateBalances = useCallback(async () => {
    if (!account || !provider) return;
    try {
      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(ethBal));

      const goldTokenContract = new ethers.Contract(
        GOLD_TOKEN_ADDRESS,
        goldTokenABI,
        provider
      );
      const goldBal = await goldTokenContract.balanceOf(account);
      setGoldBalance(ethers.formatEther(goldBal));
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  }, [account, provider, goldTokenABI]);

  // Fetch active and past loan offers
  const fetchLoans = useCallback(async () => {
    if (!account || !provider) return;
    setLoading(true);
    
    try {
      const loanContract = new ethers.Contract(
        LOAN_CONTRACT_ADDRESS,
        goldTokenLoanABI,
        provider
      );

      // Fetch active loan IDs
      const activeLoansIds = await loanContract.getActiveLoans(account);
      const activeLoansData = await Promise.all(
        activeLoansIds.map(async (id) => {
          const loan = await loanContract.loans(id);
          return {
            id: id.toString(),
            ethAmount: ethers.formatEther(loan.ethAmount),
            interestRate: Number(loan.interestRate) / 100,
            duration: Number(loan.duration) / (24 * 3600),
            isActive: loan.isActive,
            borrower: loan.borrower,
            dueDate: Number(loan.dueDate),
            isRepaid: loan.isRepaid,
            collateralAmount: ethers.formatEther(loan.collateralAmount),
          };
        })
      );
      setActiveOffers(activeLoansData);

      // Fetch past loan IDs
      const pastLoansIds = await loanContract.getPastLoans(account);
      const pastLoansData = await Promise.all(
        pastLoansIds.map(async (id) => {
          const loan = await loanContract.loans(id);
          return {
            id: id.toString(),
            ethAmount: ethers.formatEther(loan.ethAmount),
            interestRate: Number(loan.interestRate) / 100,
            duration: Number(loan.duration) / (24 * 3600),
            isActive: loan.isActive,
            borrower: loan.borrower,
            dueDate: Number(loan.dueDate),
            isRepaid: loan.isRepaid,
            collateralAmount: ethers.formatEther(loan.collateralAmount),
          };
        })
      );
      setPastOffers(pastLoansData);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  }, [account, provider, goldTokenLoanABI]);

  // Create a new loan offer
  const handleCreateLoanOffer = async () => {
    if (!account || !provider || !loanAmount || !interestRate || !duration) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const loanContract = new ethers.Contract(
        LOAN_CONTRACT_ADDRESS,
        goldTokenLoanABI,
        signer
      );

      const tx = await loanContract.createLoanOffer(
        Math.floor(parseFloat(interestRate) * 100),
        Math.floor(parseFloat(duration)),
        { value: ethers.parseEther(loanAmount) }
      );

      await tx.wait();
      alert("Loan offer created successfully!");
      await updateBalances();
      await fetchLoans();
      setLoanAmount("");
      setInterestRate("");
      setDuration("");
    } catch (error) {
      console.error("Error creating loan offer:", error);
      alert("Error creating loan offer. Please try again.");
    }
  };

  // Cancel an existing loan offer
  const handleCancelOffer = async (loanId) => {
    if (!account || !provider) return;

    try {
      const signer = await provider.getSigner();
      const loanContract = new ethers.Contract(
        LOAN_CONTRACT_ADDRESS,
        goldTokenLoanABI,
        signer
      );

      const tx = await loanContract.cancelLoanOffer(loanId);
      await tx.wait();
      alert("Loan offer cancelled successfully!");
      await updateBalances();
      await fetchLoans();
    } catch (error) {
      console.error("Error cancelling offer:", error);
      alert("Error cancelling offer. Please try again.");
    }
  };

  // Seize collateral if the loan has defaulted
  const handleSeizeCollateral = async (loanId) => {
    if (!account || !provider) return;

    try {
      const signer = await provider.getSigner();
      const loanContract = new ethers.Contract(
        LOAN_CONTRACT_ADDRESS,
        goldTokenLoanABI,
        signer
      );

      const tx = await loanContract.seizeCollateral(loanId);
      await tx.wait();
      alert("Collateral seized successfully!");
      await updateBalances();
      await fetchLoans();
    } catch (error) {
      console.error("Error seizing collateral:", error);
      alert("Error seizing collateral. Please try again.");
    }
  };

  // Fetch initial data when the component is mounted or when `account` changes
  useEffect(() => {
    if (account && provider) {
      updateBalances();
      fetchLoans();
    }
  }, [account, provider, updateBalances, fetchLoans]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lender Dashboard</h1>
      
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="mb-4 p-4 border rounded">
            <h2 className="font-semibold">Account Balance</h2>
            <p>ETH Balance: {ethBalance} ETH</p>
            <p>Gold Token Balance: {goldBalance} GOLD</p>
          </div>

          <div className="mb-4 p-4 border rounded">
            <h2 className="font-semibold mb-2">Create Loan Offer</h2>
            <div className="mb-2">
              <label className="block mb-1">Loan Amount (ETH)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="0.0"
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Interest Rate (%)</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0.0"
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Duration (days)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <button
              onClick={handleCreateLoanOffer}
              className="w-full bg-green-500 text-white px-4 py-2 rounded"
            >
              Create Offer
            </button>
          </div>

          <div className="mb-4 p-4 border rounded">
            <h2 className="font-semibold mb-2">Active Offers</h2>
            {loading ? (
              <p>Loading...</p>
            ) : activeOffers.length === 0 ? (
              <p>No active loan offers</p>
            ) : (
              activeOffers.map((offer) => (
                <div key={offer.id} className="mb-2 p-2 border rounded">
                  <p>Amount: {offer.ethAmount} ETH</p>
                  <p>Interest Rate: {offer.interestRate}%</p>
                  <p>Duration: {offer.duration} days</p>
                  <p>Collateral: {offer.collateralAmount} GOLD</p>
                  {offer.isActive && (
                    <button
                      onClick={() => handleCancelOffer(offer.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                    >
                      Cancel Offer
                    </button>
                  )}
                  {offer.borrower !== ethers.ZeroAddress &&
                    Date.now() / 1000 > offer.dueDate &&
                    !offer.isRepaid && (
                      <button
                        onClick={() => handleSeizeCollateral(offer.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Seize Collateral
                      </button>
                    )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Past Offers</h2>
            {loading ? (
              <p>Loading...</p>
            ) : pastOffers.length === 0 ? (
              <p>No past loan offers</p>
            ) : (
              pastOffers.map((offer) => (
                <div key={offer.id} className="mb-2 p-2 border rounded">
                  <p>Amount: {offer.ethAmount} ETH</p>
                  <p>Interest Rate: {offer.interestRate}%</p>
                  <p>Duration: {offer.duration} days</p>
                  <p>Status: {offer.isRepaid ? "Repaid" : "Defaulted"}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LenderDashboard;
