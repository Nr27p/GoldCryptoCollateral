// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GoldTokenABI from "../utils/GoldToken.json";
const contractAddress = process.env.REACT_APP_GOLD_TOKEN_ADDRESS;
const contractABI = GoldTokenABI.abi;

const PurchaseGold = () =>{
    const [account, setAccount] = useState('');
    const [ethBalance, setEthBalance] = useState('0');
    const [goldBalance, setGoldBalance] = useState('0');
    const [ethAmount, setEthAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [contract, setContract] = useState(null);
    const [exchangeRate, setExchangeRate] = useState('0');

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
            fetchGoldBalance();
            fetchExchangeRate();
            fetchEthBalance();
        }
    }, [account]);

    const handleAccountChange = async (accounts) => {
        if (accounts.length === 0) {
            setAccount('');
            setGoldBalance('0');
            setEthBalance('0');
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
            const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

            setAccount(accounts[0]);
            setContract(tokenContract);

            await fetchGoldBalance();
            await fetchExchangeRate();
            await fetchEthBalance();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchGoldBalance = async () => {
        try {
            if (contract && account) {
                const balance = await contract.balanceOf(account);
                setGoldBalance(ethers.formatEther(balance));
            }
        } catch (err) {
            console.error('Error fetching GOLD balance:', err);
        }
    };

    const fetchEthBalance = async () => {
        try {
            if (account) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balance = await provider.getBalance(account);
                setEthBalance(ethers.formatEther(balance));
            }
        } catch (err) {
            console.error('Error fetching ETH balance:', err);
        }
    };

    const fetchExchangeRate = async () => {
        try {
            if (contract) {
                const rate = await contract.exchangeRate();
                setExchangeRate(rate.toString());
            }
        } catch (err) {
            console.error('Error fetching exchange rate:', err);
        }
    };

    const buyTokens = async () => {
        if (!contract || !ethAmount) return;
        setError('');
        setLoading(true);

        try {
            const tx = await contract.buyGoldToken({
                value: ethers.parseEther(ethAmount)
            });
            
            await tx.wait();  // Wait for transaction to be mined
            
            await fetchGoldBalance();  // Refresh balance
            await fetchEthBalance();  // Refresh ETH balance after transaction
            
            setEthAmount('');
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
                                {/* Wallet Connection */}
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

                                {/* ETH Balance Display */}
                                {account && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Your ETH Balance:</p>
                                        <p className="text-2xl font-bold">{ethBalance} ETH</p>
                                    </div>
                                )}

                                {/* GOLD Balance Display */}
                                {account && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Your GOLD Balance:</p>
                                        <p className="text-2xl font-bold">{goldBalance} GOLD</p>
                                    </div>
                                )}

                                {/* Exchange Rate */}
                                {account && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Exchange Rate:</p>
                                        <p>1 ETH = {exchangeRate} GOLD</p>
                                    </div>
                                )}

                                {/* Buy Tokens Section */}
                                {account && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                ETH Amount to Spend
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
                                        <button
                                            onClick={buyTokens}
                                            disabled={loading || !ethAmount}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                        >
                                            {loading ? 'Processing...' : 'Buy Tokens'}
                                        </button>
                                    </div>
                                )}

                                {/* Error Display */}
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
}

export default PurchaseGold;
