import { ref, computed, onMounted, onUnmounted } from "vue";
import ethereumIcon from "../assets/ethereum.svg";
import polygonIcon from "../assets/polygon.svg";
import { AuthService } from "../services/auth";

export interface Network {
  id: string;
  name: string;
  icon: string;
}

export const networks: Network[] = [
  { id: "ethereum", name: "Ethereum", icon: ethereumIcon },
  { id: "polygon", name: "Polygon", icon: polygonIcon },
];

const activeNetwork = ref<Network>(networks[0]);
const walletAddress = ref<string | null>(null);
const isLoggedIn = ref(false);
const isFirebaseReady = ref(false);
const isLoading = ref(false);

export function useUserContext() {
  onMounted(async () => {
    try {
      isLoading.value = true;
      isFirebaseReady.value = await AuthService.testConnection();
      console.log("Firebase connection status:", isFirebaseReady.value);

      if (AuthService.isAuthenticated()) {
        const user = AuthService.getCurrentUser();
        console.log("User:", user);
        if (user?.displayName) {
          walletAddress.value = user.displayName;
          isLoggedIn.value = true;
        }
      }

      const unsubscribeAuth = AuthService.onAuthStateChange((user) => {
        if (user && user.displayName) {
          walletAddress.value = user.displayName;
          isLoggedIn.value = true;
        } else {
          walletAddress.value = null;
          isLoggedIn.value = false;
        }
      });

      const provider = window.phantom?.ethereum;
      if (provider) {
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            logout();
          }
        };

        const handleDisconnect = () => {
          logout();
        };

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("disconnect", handleDisconnect);

        onUnmounted(() => {
          unsubscribeAuth();
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("disconnect", handleDisconnect);
        });
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      isFirebaseReady.value = false;
    } finally {
      isLoading.value = false;
    }
  });

  const setActiveNetwork = async (networkId: string) => {
    const network = networks.find((n) => n.id === networkId);
    if (network) {
      try {
        if (window.phantom?.ethereum) {
          if (networkId === "polygon") {
            try {
              await window.phantom.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x89" }],
              });
            } catch (error: any) {
              if (error.code === 4902) {
                await window.phantom.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x89",
                      chainName: "Polygon",
                      nativeCurrency: {
                        name: "MATIC",
                        symbol: "MATIC",
                        decimals: 18,
                      },
                      rpcUrls: ["https://polygon-rpc.com/"],
                      blockExplorerUrls: ["https://polygonscan.com/"],
                    },
                  ],
                });
              }
            }
          } else if (networkId === "ethereum") {
            await window.phantom.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x1" }],
            });
          }
        }

        activeNetwork.value = network;
        localStorage.setItem("activeNetworkId", networkId);
      } catch (error) {
        console.error("Error switching network:", error);
        throw error;
      }
    }
  };

  const login = async () => {
    try {
      isLoading.value = true;
      const provider = window.phantom?.ethereum;
      if (!provider) {
        throw new Error("Phantom wallet is not installed!");
      }

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts[0]) {
        const session = await AuthService.loginWithPhantom(accounts[0], activeNetwork.value.id);
        walletAddress.value = session.address;
        isLoggedIn.value = true;
        return session;
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      isLoading.value = true;
      await AuthService.logout();
      walletAddress.value = null;
      isLoggedIn.value = false;
      activeNetwork.value = networks[0];
      localStorage.removeItem("activeNetworkId");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const truncatedAddress = computed(() => {
    if (!walletAddress.value) return "";
    return `${walletAddress.value.slice(0, 8)}...${walletAddress.value.slice(-4)}`;
  });

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
  };
}

declare global {
  interface Window {
    phantom?: {
      ethereum?: {
        isPhantom?: boolean;
        request: (args: {
          method: "eth_requestAccounts" | "wallet_requestPermissions" | "wallet_disconnect" | "wallet_switchEthereumChain" | "wallet_addEthereumChain";
          params?: any[];
        }) => Promise<any>;
        on: (event: string, callback: (params?: any) => void) => void;
        removeListener: (event: string, callback: (params?: any) => void) => void;
      };
    };
  }
}
