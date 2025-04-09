import axios from "axios";

export interface Token {
  token_address: string;
  symbol: string;
  name: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  total_supply: string | null;
  total_supply_formatted: string | null;
  percentage_relative_to_total_supply: number | null;
  security_score: number | null;
  balance_formatted: string;
  usd_price: number;
  usd_price_24hr_percent_change: number;
  usd_price_24hr_usd_change: number;
  usd_value: number;
  usd_value_24hr_usd_change: number | null;
  native_token: boolean;
  portfolio_percentage: number;
}

export interface TokenResponse {
  cursor: string | null;
  page: number;
  page_size: number;
  block_number: number;
  result: Token[];
}

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
