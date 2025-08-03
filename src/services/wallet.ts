import type { TransactionData } from "./openai";
import type { Network } from "../types/network";
import { TransactionRequest } from "../types/transaction";
import { ethers } from "ethers";

export class WalletService {
  /**
   * Gets the current gas price from the network
   * @param provider The Phantom provider
   * @returns Promise<string> The gas price in hex format
   */
  private static async getGasPrice(provider: any): Promise<string> {
    try {
      // Create an ethers provider from the Phantom provider
      const ethersProvider = new ethers.BrowserProvider(provider);

      // Get the current fee data which includes gas price
      const feeData = await ethersProvider.getFeeData();

      // Use gasPrice if available, otherwise use maxFeePerGas
      const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;

      if (!gasPrice) {
        throw new Error("Could not get gas price from network");
      }

      // Convert to hex format
      return ethers.toBeHex(gasPrice);
    } catch (error) {
      console.error("Error getting gas price:", error);
      // Fallback to a default gas price if we can't get it from the network
      return ethers.toBeHex(ethers.parseUnits("20", "gwei"));
    }
  }

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

      // Get gas price if not provided
      let gasPrice = transactionData.transactionRequest.gasPrice;
      if (!gasPrice) {
        gasPrice = await this.getGasPrice(provider);
      }

      // Prepare the transaction
      const transaction: TransactionRequest = {
        gasLimit: transactionData.transactionRequest.gasLimit || ethers.toBeHex(10000000),
        gasPrice: gasPrice,
        to: transactionData.transactionRequest.to,
        from: transactionData.transactionRequest.from,
        value: transactionData.transactionRequest.value,
      };

      // Add data if it exists
      if (transactionData.transactionRequest.data) {
        transaction.data = transactionData.transactionRequest.data;
      }

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
