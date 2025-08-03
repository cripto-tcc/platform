import { ref, computed } from 'vue'
import ethereumIcon from '@/src/assets/ethereum.svg'
import polygonIcon from '@/src/assets/polygon.svg'
import baseIcon from '@/src/assets/base.svg'
import { AuthService } from '@/src/services/auth'
import { Network } from '@/src/types/network'

export const networks: Network[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    icon: ethereumIcon,
    chainId: '0x1',
    apiId: 'eth',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: polygonIcon,
    chainId: '0x89',
    apiId: 'pol',
    chainConfig: {
      chainId: '0x89',
      chainName: 'Polygon',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com/'],
    },
  },
  {
    id: 'base',
    name: 'Base',
    icon: baseIcon,
    chainId: '0x2105',
    apiId: 'bas',
    chainConfig: {
      chainId: '0x2105',
      chainName: 'Base',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org'],
    },
  },
]

const activeNetwork = ref<Network>(networks[0])
const walletAddress = ref<string | null>(null)
const isLoggedIn = ref(false)
const isFirebaseReady = ref(false)
const isLoading = ref(false)

export function useUserContext() {
  let provider: NonNullable<Window['phantom']>['ethereum'] | null = null

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      logout()
    }
  }

  const handleDisconnect = () => {
    logout()
  }

  const restoreSavedNetwork = async () => {
    const savedNetworkId = localStorage.getItem('activeNetworkId')
    const network = savedNetworkId
      ? networks.find(n => n.id === savedNetworkId)
      : networks[0]

    if (network) {
      activeNetwork.value = network

      if (window.phantom?.ethereum && network.id !== 'ethereum') {
        try {
          await setActiveNetwork(network.id)
        } catch (error) {
          console.error('Failed to restore network:', error)
          activeNetwork.value = networks[0]
          localStorage.setItem('activeNetworkId', networks[0].id)
        }
      }
    }
  }

  const setupAuthState = async () => {
    isFirebaseReady.value = await AuthService.testConnection()

    if (AuthService.isAuthenticated()) {
      const user = AuthService.getCurrentUser()
      walletAddress.value = user?.displayName || null
      isLoggedIn.value = true
    }

    AuthService.onAuthStateChange(user => {
      if (user && user.displayName) {
        walletAddress.value = user.displayName
        isLoggedIn.value = true
      } else {
        walletAddress.value = null
        isLoggedIn.value = false
      }
    })
  }

  const setupWalletListeners = () => {
    provider = window.phantom?.ethereum || null
    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('disconnect', handleDisconnect)
    }
  }

  const initialize = async () => {
    try {
      isLoading.value = true

      await restoreSavedNetwork()
      await setupAuthState()
      setupWalletListeners()
    } catch (error) {
      console.error('Error initializing Firebase:', error)
      isFirebaseReady.value = false
    } finally {
      isLoading.value = false
    }
  }

  const cleanup = () => {
    if (provider) {
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('disconnect', handleDisconnect)
    }
  }

  const setActiveNetwork = async (networkId: string) => {
    const network = networks.find(n => n.id === networkId)
    if (network) {
      activeNetwork.value = network
      localStorage.setItem('activeNetworkId', networkId)
    }
  }

  const login = async () => {
    try {
      isLoading.value = true
      const provider = window.phantom?.ethereum
      if (!provider) {
        throw new Error('Phantom wallet is not installed!')
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      })

      if (accounts[0]) {
        const session = await AuthService.loginWithPhantom(
          accounts[0],
          activeNetwork.value.id
        )
        walletAddress.value = session.address
        isLoggedIn.value = true
        return session
      }

      throw new Error('No accounts found')
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      await AuthService.logout()

      if (activeNetwork.value.id !== 'ethereum') {
        try {
          await setActiveNetwork('ethereum')
        } catch (error) {
          console.error('Failed to switch back to Ethereum:', error)
        }
      }

      walletAddress.value = null
      isLoggedIn.value = false
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const truncatedAddress = computed(() => {
    if (!walletAddress.value) return ''
    return `${walletAddress.value.slice(0, 8)}...${walletAddress.value.slice(-4)}`
  })

  return {
    networks,
    activeNetwork,
    walletAddress,
    isLoggedIn,
    isFirebaseReady,
    isLoading,
    truncatedAddress,
    setActiveNetwork,
    login,
    logout,
    initialize,
    cleanup,
  }
}

declare global {
  interface Window {
    phantom?: {
      ethereum?: {
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
        removeListener: (
          event: string,
          callback: (params?: any) => void
        ) => void
      }
    }
  }
}
