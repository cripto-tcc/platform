import axios from "axios";
import { TokenResponse } from "../types/moralis";

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
}
