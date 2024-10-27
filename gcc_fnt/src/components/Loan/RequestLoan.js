// frontend/src/components/Loan/RequestLoan.js
import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';

const RequestLoan = () => {
  const { web3, account } = useWeb3();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestLoan = async () => {
    if (!web3 || !account) return;
    setLoading(true);
    try {
      const weiAmount = web3.utils.toWei(collateralAmount, 'ether');
      
      // First approve tokens
      await goldToken.methods.approve(LOAN_CONTRACT_ADDRESS, weiAmount)
        .send({ from: account });
        
      // Then request loan
      await loanContract.methods.requestLoan(weiAmount)
        .send({ from: account });
        
      setCollateralAmount('');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <input
        type="number"
        value={collateralAmount}
        onChange={(e) => setCollateralAmount(e.target.value)}
        placeholder="Collateral Amount"
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={handleRequestLoan}
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Request Loan'}
      </button>
    </div>
  );
};

export default RequestLoan;