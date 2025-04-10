import axios from "axios";
import { TokenResponse, Transaction, TransactionResponse } from "../types/moralis";

export class MoralisService {
  private static readonly BASE_URL = import.meta.env.VITE_MORALIS_API_URL;
  private static readonly API_KEY = import.meta.env.VITE_MORALIS_API_KEY;

  static async getWalletTokens(walletAddress: string, chain: string): Promise<TokenResponse> {
    const response = await axios.get<TokenResponse>(`${this.BASE_URL}/wallets/${walletAddress}/tokens`, {
      params: { chain },
      headers: {
        "X-API-Key": this.API_KEY,
        Accept: "application/json",
      },
    });

    response.data.result = response.data.result.filter((token) => token.usd_value > 0.01);

    console.log(response.data);
    return response.data;
  }

  static async getWalletHistory(address: string, chainId: string): Promise<TransactionResponse> {
    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/history?chain=${chainId}&limit=5`, {
      headers: {
        "X-API-Key": import.meta.env.VITE_MORALIS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch wallet history");
    }

    const data = await response.json();

    data.result = data.result.map((transaction: Transaction) => ({
      ...transaction,
      erc20_transfers: transaction.erc20_transfers.filter((transfer) => transfer.verified_contract && !transfer.possible_spam),
    }));

    return data;
  }
}
