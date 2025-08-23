import { ref, computed } from 'vue'
import ethereumIcon from '@/src/assets/ethereum.svg'
import polygonIcon from '@/src/assets/polygon.svg'
import baseIcon from '@/src/assets/base.svg'
import { AuthService } from '@/src/services/auth'
import { Network } from '@/src/types/network'
import type { PhantomProvider } from '@/src/types/global'
import { getPhantomProvider } from '@/src/helpers/getProvider'

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
  },
  {
    id: 'base',
    name: 'Base',
    icon: baseIcon,
    chainId: '0x2105',
    apiId: 'bas',
  },
]

const activeNetwork = ref<Network>(networks[0])
const walletAddress = ref<string | null>(null)
const isLoggedIn = ref(false)
const isFirebaseReady = ref(false)
const isLoading = ref(false)

export function useUserContext() {
  const restoreSavedNetwork = async () => {
    const savedNetworkId = localStorage.getItem('activeNetworkId')
    const network = networks.find(n => n.id === savedNetworkId) || networks[0]

    activeNetwork.value = network

    if (window.phantom?.ethereum) {
      await setActiveNetwork(network.id)
      localStorage.setItem('activeNetworkId', network.id)
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

  const initialize = async () => {
    try {
      isLoading.value = true

      await restoreSavedNetwork()
      await setupAuthState()
    } catch (error) {
      console.error('Error initializing Firebase:', error)
      isFirebaseReady.value = false
    } finally {
      isLoading.value = false
    }
  }

  const setActiveNetwork = async (networkId: string) => {
    const network = networks.find(n => n.id === networkId)
    if (network) {
      activeNetwork.value = network
      localStorage.setItem('activeNetworkId', networkId)
    }
  }

  const requestAccounts = async (provider: PhantomProvider) => {
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts?.[0]) {
      throw new Error('No accounts found')
    }

    return accounts[0]
  }

  const createUserSession = async (address: string) => {
    const session = await AuthService.loginWithPhantom(
      address,
      activeNetwork.value.id
    )

    walletAddress.value = session.address
    isLoggedIn.value = true

    return session
  }

  const login = async () => {
    try {
      isLoading.value = true

      const provider = getPhantomProvider()
      const accountAddress = await requestAccounts(provider)
      const session = await createUserSession(accountAddress)

      return session
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
  }
}
