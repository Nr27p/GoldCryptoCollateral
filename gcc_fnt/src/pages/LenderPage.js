import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LoanContractABI from "../utils/LoanContract.json";
const contractAddress = "0x60d0A60c37B2a60C23bD215Ab55b9a211519a89e";
const contractABI = LoanContractABI.abi;

const LenderPage = () => {
  const [account, setAccount] = useState('');
  const [loanOffers, setLoanOffers] = useState([]);
  const [ethAmount, setEthAmount] = useState('');
  const [interestRate, setInterestRate] = useState('10');
  const [daysToRepay, setDaysToRepay] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    // Listen for account changes
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
    // Fetch loan offers on component mount
    fetchLoanOffers();
  }, [contract]);

  const handleAccountChange = async (accounts) => {
    if (accounts.length === 0) {
      // Handle disconnection
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
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

      setAccount(accounts[0]);
      setContract(contractInstance);

      await fetchLoanOffers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanOffers = async () => {
    try {
      if (contract) {
        const offers = await contract.getLoanOffers();
        // Filter out any offers with an ethAmount of 0
        // console.log(offers);
        const filteredOffers = offers.filter(offer => ethers.formatEther(offer.ethAmount) !== "0.0");
  
        // Set the filtered offers to state
        setLoanOffers(filteredOffers);
      }
    } catch (err) {
      console.error("Error fetching loan offers:", err);
    }
  };

  const createLoanOffer = async () => {
    if (!contract || !ethAmount || !interestRate || !daysToRepay) return;
    setError('');
    setLoading(true);

    try {
      const tx = await contract.createLoanOffer(
        ethers.parseEther(ethAmount),
        interestRate,
        daysToRepay,
        { value: ethers.parseEther(ethAmount) }
      );
      await tx.wait();
      await fetchLoanOffers();
      setEthAmount('');
      setInterestRate('10');
      setDaysToRepay('30');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelLoanOffer = async (index) => {
    if (!contract) return;
    setError('');
    setLoading(true);

    try {
      const tx = await contract.cancelLoanOffer(index);
      await tx.wait();
      await fetchLoanOffers();
    } catch (err) {
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ETH Amount to Lend
                      </label>
                      <input
                        type="number"
                        value={ethAmount}
                        onChange={(e) => setEthAmount(e.target.value)}
                        placeholder="0.0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="10"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Days to Repay
                      </label>
                      <input
                        type="number"
                        value={daysToRepay}
                        onChange={(e) => setDaysToRepay(e.target.value)}
                        placeholder="30"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={loading}
                      />
                    </div>
                    <button
                      onClick={createLoanOffer}
                      disabled={loading || !ethAmount || !interestRate || !daysToRepay}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Processing...' : 'Create Loan Offer'}
                    </button>
                  </div>
                )}

                {account && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Loan Offers:</p>
                    <ul className="space-y-2">
                      {loanOffers.map((offer, index) => (
                        <li key={index} className="bg-gray-100 rounded-md p-4">
                          <p>
                            ETH Amount: {ethers.formatEther(offer.ethAmount)} ETH
                          </p>
                          <p>Interest Rate: {offer.interestRate}%</p>
                          <p>Days to Repay: {offer.daysToRepay}</p>
                          <p>Lender: {`${offer.lender.substring(0, 6)}...${offer.lender.substring(38)}`}</p>
                          <button
                            onClick={() => cancelLoanOffer(index)}
                            disabled={loading}
                            className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {loading ? 'Cancelling...' : 'Cancel Offer'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-red-600 text-sm">
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

export default LenderPage;