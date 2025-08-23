export interface PhantomProvider {
  getSigner(): unknown
  isPhantom?: boolean
  request: (args: {
    method:
      | 'eth_requestAccounts'
      | 'wallet_requestPermissions'
      | 'wallet_disconnect'
      | 'wallet_switchEthereumChain'
      | 'wallet_addEthereumChain'
      | 'eth_sendTransaction'
      | 'eth_signTransaction'
      | 'eth_getTransactionReceipt'
    params?: any[]
  }) => Promise<any>
  on: (event: string, callback: (params?: any) => void) => void
  removeListener: (event: string, callback: (params?: any) => void) => void
}

declare global {
  interface Window {
    phantom?: {
      ethereum?: PhantomProvider
    }
  }
}

export {}
