import type { TransactionData } from "./openai";
import type { Network } from "../types/network";

export class WalletService {
  static async sendTransaction(transactionData: TransactionData, activeNetwork?: Network): Promise<string> {
    const provider = window.phantom?.ethereum;

    if (!provider) {
      throw new Error("Phantom wallet is not installed!");
    }

    try {
      // Check if we need to switch networks
      if (activeNetwork && activeNetwork.id !== "eth") {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: activeNetwork.chainId }],
          });
        } catch (switchError: any) {
          // If the network is not added, add it
          if (switchError.code === 4902 && activeNetwork.chainConfig) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [activeNetwork.chainConfig],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Prepare the transaction
      const transaction = {
        gasLimit: transactionData.transactionRequest.gasLimit,
        gasPrice: transactionData.transactionRequest.gasPrice,
        to: transactionData.transactionRequest.to,
        from: transactionData.transactionRequest.from,
        value: transactionData.transactionRequest.value,
        data: transactionData.transactionRequest.data || "0x", // Optional data field
      };

      console.log("transaction", transaction);
      console.log("activeNetwork", activeNetwork);

      // Send the transaction
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return txHash;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }
}
