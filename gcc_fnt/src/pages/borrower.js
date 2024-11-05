// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import GoldTokenABI from "../utils/GoldToken.json";
// import GoldTokenLoanABI from "../utils/GoldTokenLoan.json";

// const goldTokenABI = GoldTokenABI.abi;
// const goldTokenLoanABI = GoldTokenLoanABI.abi;

// const GOLD_TOKEN_ADDRESS = "0x1c0d81e949251529bb29dca12b7fca78cF5ba896";
// const LOAN_CONTRACT_ADDRESS = "0xEAFCd51BBB36fF7a286D76A942eDdb9F3a1dBe9e";

// const BorrowerDashboard = () => {
//   const [account, setAccount] = useState(null);
//   const [provider, setProvider] = useState(null);
//   const [ethBalance, setEthBalance] = useState("0");
//   const [goldBalance, setGoldBalance] = useState("0");
//   const [activeLoans, setActiveLoans] = useState([]);
//   const [pastLoans, setPastLoans] = useState([]);
//   const [remainingRepayment, setRemainingRepayment] = useState({});

//   useEffect(() => {
//     if (account && provider) {
//       updateBalances();
//       fetchActiveLoans();
//       fetchPastLoans();
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

//   const fetchActiveLoans = async () => {
//     try {
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         provider
//       );
//       const loans = await loanContract.getActiveLoans(account);
//       const formattedLoans = loans.map((loan) => ({
//         id: loan.id,
//         ethAmount: ethers.formatEther(loan.ethAmount),
//         interestRate: loan.interestRate / 100,
//         duration: loan.duration / (24 * 3600),
//         borrower: loan.borrower,
//         dueDate: loan.dueDate,
//         isRepaid: loan.isRepaid,
//         collateralAmount: ethers.formatEther(loan.collateralAmount),
//       }));
//       setActiveLoans(formattedLoans);
//       const remainingRepaymentPromises = formattedLoans.map(async (loan) => {
//         const remaining = await loanContract.getRemainingRepaymentAmount(loan.id);
//         return { [loan.id]: ethers.formatEther(remaining) };
//       });
//       const remainingRepaymentData = await Promise.all(remainingRepaymentPromises);
//       const remainingRepaymentObject = remainingRepaymentData.reduce(
//         (acc, curr) => ({ ...acc, ...curr }),
//         {}
//       );
//       setRemainingRepayment(remainingRepaymentObject);
//     } catch (error) {
//       console.error("Error fetching active loans:", error);
//     }
//   };

//   const fetchPastLoans = async () => {
//     try {
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         provider
//       );
//       const loans = await loanContract.getPastLoans(account);
//       const formattedLoans = loans.map((loan) => ({
//         id: loan.id,
//         ethAmount: ethers.formatEther(loan.ethAmount),
//         interestRate: loan.interestRate / 100,
//         duration: loan.duration / (24 * 3600),
//         borrower: loan.borrower,
//         dueDate: loan.dueDate,
//         isRepaid: loan.isRepaid,
//         collateralAmount: ethers.formatEther(loan.collateralAmount),
//       }));
//       setPastLoans(formattedLoans);
//     } catch (error) {
//       console.error("Error fetching past loans:", error);
//     }
//   };

//   const handleTakeLoan = async (loanId, collateralAmount) => {
//     try {
//       const signer = await provider.getSigner();
//       const loanContract = new ethers.Contract(
//         LOAN_CONTRACT_ADDRESS,
//         goldTokenLoanABI,
//         signer
//       );

//       const goldTokenContract = new ethers.Contract(
//         GOLD_TOKEN_ADDRESS,
//         goldTokenABI,
//         signer
//       );

//       await goldTokenContract.approve(LOAN_CONTRACT_ADDRESS, ethers.parseEther(collateralAmount.toString()));

//       const tx = await loanContract.takeLoan(loanId);
//       await tx.wait();
//       updateBalances();
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

//       const repaymentAmount = await loanContract.getRemainingRepaymentAmount(loanId);
//       const tx = await loanContract.repayLoan(loanId, { value: repaymentAmount });
//       await tx.wait();
//       updateBalances();
//       fetchActiveLoans();
//     } catch (error) {
//       console.error("Error repaying loan:", error);
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
//             <h2>Available Loans</h2>
//             {activeLoans.length === 0 ? (
//               <p>No active loans available</p>
//             ) : (
//               <ul>
//                 {activeLoans.map((loan) => (
//                   <li key={loan.id}>
//                     <p>Loan Amount: {ethers.formatEther(loan.ethAmount)} ETH</p>
//                     <p>Interest Rate: {loan.interestRate / 100}%</p>
//                     <p>Duration: {loan.duration / (24 * 3600)} days</p>
//                     <p>Remaining Repayment: {remainingRepayment[loan.id] || "Loading..."} ETH</p>
//                     {loan.borrower === ethers.ZeroAddress ? (  // Use ethers.ZeroAddress here
//                       <button
//                         onClick={() => handleTakeLoan(loan.id, loan.collateralAmount)}
//                       >
//                         Take Loan
//                       </button>
//                     ) : (
//                       <>
//                         <p>Due Date: {new Date(loan.dueDate * 1000).toLocaleString()}</p>
//                         {!loan.isRepaid && (
//                           <button onClick={() => handleRepayLoan(loan.id)}>
//                             Repay Loan
//                           </button>
//                         )}
//                       </>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           <div>
//             <h2>Past Loans</h2>
//             {pastLoans.length === 0 ? (
//               <p>No past loans</p>
//             ) : (
//               <ul>
//                 {pastLoans.map((loan) => (
//                   <li key={loan.id}>
//                     <p>Loan Amount: {ethers.formatEther(loan.ethAmount)} ETH</p>
//                     <p>Interest Rate: {loan.interestRate / 100}%</p>
//                     <p>Duration: {loan.duration / (24 * 3600)} days</p>
//                     <p>Status: {loan.isRepaid ? "Repaid" : "Defaulted"}</p>
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


// export default BorrowerDashboard;
