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

  static async signTransaction(transactionData: TransactionData): Promise<string> {
    const provider = window.phantom?.ethereum;

    if (!provider) {
      throw new Error("Phantom wallet is not installed!");
    }

    try {
      // Prepare the transaction
      const transaction = {
        from: transactionData.transactionRequest.from,
        to: transactionData.transactionRequest.to,
        value: transactionData.transactionRequest.value,
        gasLimit: transactionData.transactionRequest.gasLimit,
        maxFeePerGas: transactionData.transactionRequest.gasPrice,
        maxPriorityFeePerGas: "10", // Default priority fee
        nonce: "0", // Will be auto-filled by wallet
        data: transactionData.transactionRequest.data || "0x", // Optional data field
      };

      // Sign the transaction
      const signedTx = await provider.request({
        method: "eth_signTransaction",
        params: [transaction],
      });

      return signedTx;
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }
  }

  static async getTransactionStatus(txHash: string): Promise<string> {
    const provider = window.phantom?.ethereum;

    if (!provider) {
      throw new Error("Phantom wallet is not installed!");
    }

    try {
      const receipt = await provider.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      });

      return receipt?.status === "0x1" ? "success" : "failed";
    } catch (error) {
      console.error("Error getting transaction status:", error);
      throw error;
    }
  }
}
