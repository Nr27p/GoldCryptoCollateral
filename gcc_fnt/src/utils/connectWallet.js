import { BrowserProvider } from "ethers";

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return {
        address: await signer.getAddress(),
        signer: signer
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return null;
    }
  } else {
    console.error("Metamask not found");
    return null;
  }
};