export interface TransactionRequest {
  value: string;
  to: string;
  data?: string;
  gasPrice: string;
  gasLimit: string;
  from: string;
}

export interface TokenInfo {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  coinKey: string;
  logoURI: string;
  priceUSD: string;
}

export interface FeeCost {
  name: string;
  description: string;
  token: TokenInfo;
  amount: string;
  amountUSD: string;
  percentage: string;
  included: boolean;
  feeSplit: {
    integratorFee: string;
    lifiFee: string;
  };
}

export interface GasCost {
  type: string;
  price: string;
  estimate: string;
  limit: string;
  amount: string;
  amountUSD: string;
  token: TokenInfo;
}

export interface SwapEstimate {
  tool: string;
  approvalAddress: string;
  toAmountMin: string;
  toAmount: number;
  fromAmount: number;
  feeCosts: FeeCost[];
  gasCosts: GasCost[];
  executionDuration: number;
  fromAmountUSD: number;
  toAmountUSD: number;
}

export interface TransactionData {
  transactionRequest: TransactionRequest;
  fromToken: string;
  toToken: string;
  tool: string;
  estimate: SwapEstimate;
}

export interface TransactionMessage {
  type: "transaction";
  data: TransactionData;
}
