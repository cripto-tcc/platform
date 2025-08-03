export interface Network {
  id: string
  name: string
  icon: string
  chainId: string
  chainConfig?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
}
