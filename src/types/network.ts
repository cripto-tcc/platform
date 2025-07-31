export interface Network {
  id: string;
  name: string;
  icon: string;
  chainId: string;
  apiId: string; // ID para usar na API local (pol, bas, etc.)
  chainConfig?: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}
