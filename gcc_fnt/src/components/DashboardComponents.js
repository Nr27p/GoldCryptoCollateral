// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import GoldTokenABI from "../utils/GoldToken.json";
// import GoldTokenLoanABI from "../utils/GoldTokenLoan.json";

// const goldTokenABI = GoldTokenABI.abi;
// const goldTokenLoanABI = GoldTokenLoanABI.abi;

// const GOLD_TOKEN_ADDRESS = "0x1c0d81e949251529bb29dca12b7fca78cF5ba896";
// const LOAN_CONTRACT_ADDRESS = "0xEAFCd51BBB36fF7a286D76A942eDdb9F3a1dBe9e";

// const LenderDashboard = () => {
//   const [account, setAccount] = useState(null);
//   const [provider, setProvider] = useState(null);
//   const [ethBalance, setEthBalance] = useState("0");
//   const [goldBalance, setGoldBalance] = useState("0");
//   const [loanAmount, setLoanAmount] = useState("");
//   const [interestRate, setInterestRate] = useState("");
//   const [duration, setDuration] = useState("");
//   const [allOffers, setAllOffers] = useState([]);
//   const [activeOffers, setActiveOffers] = useState([]);

//   useEffect(() => {
//     if (account && provider) {
//       updateBalances();
//       fetchAllOffers();
//     }
//   }, [account, provider]);

//   const connectWallet = async () => {
//     try {
//       if (window.ethereum) {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const accounts = await provider.send("eth_requestAccounts", []);
//         setAccount(accounts[0]);
//         setProvider(provider);
//       }
//     } catch (error) {
//       console.error("Error connecting wallet:", error);
//     }
//   };

//   const updateBalances = async () => {
//     const ethBal = await provider.getBalance(account);
//     setEthBalance(ethers.formatEther(ethBal));
    
//     const goldTokenContract = new ethers.Contract(
//       GOLD_TOKEN_ADDRESS,
//       goldTokenABI,
//       provider
//     );
//     const goldBal = await goldTokenContract.balanceOf(account);
//     setGoldBalance(ethers.formatEther(goldBal));
//   };

//   const fetchAllOffers = async () => {
//     try {
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         provider
//       );
//       const offers = await loanContract.loans(0, 100); // Fetch the first 100 offers
//       setAllOffers(offers);
//       setActiveOffers(offers.filter((offer) => offer.isActive));
//     } catch (error) {
//       console.error("Error fetching all offers:", error);
//     }
//   };

//   const handleCreateLoanOffer = async () => {
//     try {
//       const signer = await provider.getSigner();
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         signer
//       );

//       const tx = await loanContract.createLoanOffer(
//         Math.floor(parseFloat(interestRate) * 100),
//         duration,
//         { value: ethers.parseEther(loanAmount) }
//       );
//       await tx.wait();
//       updateBalances();
//       fetchAllOffers();
//     } catch (error) {
//       console.error("Error creating loan offer:", error);
//     }
//   };

//   const handleCancelLoanOffer = async (loanId) => {
//     try {
//       const signer = await provider.getSigner();
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         signer
//       );

//       const tx = await loanContract.cancelLoanOffer(loanId);
//       await tx.wait();
//       updateBalances();
//       fetchAllOffers();
//     } catch (error) {
//       console.error("Error cancelling loan offer:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Lender Dashboard</h1>
//       {!account && (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//       {account && (
//         <>
//           <div>
//             <h2>Account Balance</h2>
//             <p>ETH Balance: {ethBalance} ETH</p>
//             <p>Gold Token Balance: {goldBalance} GOLD</p>
//           </div>
//           <div>
//             <h2>Create Loan Offer</h2>
//             <div>
//               <label>Loan Amount (ETH)</label>
//               <input
//                 type="number"
//                 value={loanAmount}
//                 onChange={(e) => setLoanAmount(e.target.value)}
//                 placeholder="0.0"
//               />
//             </div>
//             <div>
//               <label>Interest Rate (%)</label>
//               <input
//                 type="number"
//                 value={interestRate}
//                 onChange={(e) => setInterestRate(e.target.value)}
//                 placeholder="0.0"
//               />
//             </div>
//             <div>
//               <label>Duration (days)</label>
//               <input
//                 type="number"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 placeholder="0"
//               />
//             </div>
//             <button onClick={handleCreateLoanOffer}>Create Offer</button>
//           </div>
//           <div>
//             <h2>Active Offers</h2>
//             {activeOffers.length === 0 ? (
//               <p>No active loan offers</p>
//             ) : (
//               <ul>
//                 {activeOffers.map((offer) => (
//                   <li key={offer.id}>
//                     <p>Amount: {ethers.formatEther(offer.ethAmount)} ETH</p>
//                     <p>Interest Rate: {offer.interestRate / 100}%</p>
//                     <p>Duration: {offer.duration / (24 * 3600)} days</p>
//                     <button
//                       onClick={() => handleCancelLoanOffer(offer.id)}
//                     >
//                       Cancel Offer
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// const BorrowerDashboard = () => {
//   const [account, setAccount] = useState(null);
//   const [provider, setProvider] = useState(null);
//   const [ethBalance, setEthBalance] = useState("0");
//   const [goldBalance, setGoldBalance] = useState("0");
//   const [availableLoans, setAvailableLoans] = useState([]);
//   const [activeLoans, setActiveLoans] = useState([]);

//   useEffect(() => {
//     if (account && provider) {
//       updateBalances();
//       fetchAvailableLoans();
//       fetchActiveLoans();
//     }
//   }, [account, provider]);

//   const connectWallet = async () => {
//     try {
//       if (window.ethereum) {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const accounts = await provider.send("eth_requestAccounts", []);
//         setAccount(accounts[0]);
//         setProvider(provider);
//       }
//     } catch (error) {
//       console.error("Error connecting wallet:", error);
//     }
//   };

//   const updateBalances = async () => {
//     const ethBal = await provider.getBalance(account);
//     setEthBalance(ethers.formatEther(ethBal));
    
//     const goldTokenContract = new ethers.Contract(
//       GOLD_TOKEN_ADDRESS,
//       goldTokenABI,
//       provider
//     );
//     const goldBal = await goldTokenContract.balanceOf(account);
//     setGoldBalance(ethers.formatEther(goldBal));
//   };

//   const fetchAvailableLoans = async () => {
//     try {
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         provider
//       );
//       const loans = await loanContract.getAvailableLoans();
//       setAvailableLoans(loans);
//     } catch (error) {
//       console.error("Error fetching available loans:", error);
//     }
//   };

//   const fetchActiveLoans = async () => {
//     try {
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         provider
//       );
//       const loans = await loanContract.getActiveLoans(account);
//       setActiveLoans(loans);
//     } catch (error) {
//       console.error("Error fetching active loans:", error);
//     }
//   };

//   const handleTakeLoan = async (loanId) => {
//     try {
//       const signer = await provider.getSigner();
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         signer
//       );

//       const tx = await loanContract.takeLoan(loanId);
//       await tx.wait();
//       updateBalances();
//       fetchAvailableLoans();
//       fetchActiveLoans();
//     } catch (error) {
//       console.error("Error taking loan:", error);
//     }
//   };

//   const handleRepayLoan = async (loanId) => {
//     try {
//       const signer = await provider.getSigner();
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         signer
//       );

//       const remainingAmount = await loanContract.getRemainingRepaymentAmount(loanId);
//       const tx = await loanContract.repayLoan(loanId, { value: remainingAmount });
//       await tx.wait();
//       updateBalances();
//       fetchActiveLoans();
//     } catch (error) {
//       console.error("Error repaying loan:", error);
//     }
//   };

//   const handleSeizeCollateral = async (loanId) => {
//     try {
//       const signer = await provider.getSigner();
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         signer
//       );

//       const tx = await loanContract.seizeCollateral(loanId);
//       await tx.wait();
//       updateBalances();
//       fetchActiveLoans();
//     } catch (error) {
//       console.error("Error seizing collateral:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Borrower Dashboard</h1>
//       {!account && (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//       {account && (
//         <>
//           <div>
//             <h2>Account Balance</h2>
//             <p>ETH Balance: {ethBalance} ETH</p>
//             <p>Gold Token Balance: {goldBalance} GOLD</p>
//           </div>
//           <div>
//             <h2>Available Loan Offers</h2>
//             {availableLoans.length === 0 ? (
//               <p>No available loan offers</p>
//             ) : (
//               <ul>
//                 {availableLoans.map((loan) => (
//                   <li key={loan.id}>
//                     <p>Amount: {ethers.formatEther(loan.ethAmount)} ETH</p>
//                     <p>Interest Rate: {loan.interestRate / 100}%</p>
//                     <p>Duration: {loan.duration / (24 * 3600)} days</p>
//                     <button
//                       onClick={() => handleTakeLoan(loan.id)}
//                     >
//                       Take Loan
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           <div>
//             <h2>Active Loans</h2>
//             {activeLoans.length === 0 ? (
//               <p>No active loans</p>
//             ) : (
//               <ul>
//                 {activeLoans.map((loan) => (
//                   <li key={loan.id}>
//                     <p>Amount: {ethers.formatEther(loan.ethAmount)} ETH</p>
//                     <p>Interest Rate: {loan.interestRate / 100}%</p>
//                     <p>Duration: {loan.duration / (24 * 3600)} days</p>
//                     <p>Status: {loan.isRepaid ? 'Repaid' : 'Active'}</p>
//                     {!loan.isRepaid && (
//                       <button
//                         onClick={() => handleRepayLoan(loan.id)}
//                       >
//                         Repay Loan
//                       </button>
//                     )}
//                     {loan.isRepaid && loan.borrower === account && (
//                       <button
//                         onClick={() => handleSeizeCollateral(loan.id)}
//                       >
//                         Seize Collateral
//                       </button>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export { LenderDashboard, BorrowerDashboard };