import { useState, useEffect, useCallback } from "react";
import ethereumIcon from "../assets/ethereum.svg";
import polygonIcon from "../assets/polygon.svg";
import baseIcon from "../assets/base.svg";
import { AuthService } from "../services/auth";
import { Network } from "../types/network";

export const networks: Network[] = [
  {
    id: "eth",
    name: "Ethereum",
    icon: ethereumIcon,
    chainId: "0x1",
  },
  {
    id: "polygon",
    name: "Polygon",
    icon: polygonIcon,
    chainId: "0x89",
    chainConfig: {
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
  },
  {
    id: "base",
    name: "Base",
    icon: baseIcon,
    chainId: "0x2105",
    chainConfig: {
      chainId: "0x2105",
      chainName: "Base",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://mainnet.base.org"],
      blockExplorerUrls: ["https://basescan.org"],
    },
  },
];

export function useUserContext() {
  const [activeNetwork, setActiveNetworkState] = useState<Network>(networks[0]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      logout();
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    logout();
  }, []);

  const restoreSavedNetwork = useCallback(async () => {
    const savedNetworkId = localStorage.getItem("activeNetworkId");
    const network = savedNetworkId ? networks.find((n) => n.id === savedNetworkId) : networks[0];

    if (network) {
      setActiveNetworkState(network);

      if (window.phantom?.ethereum && network.id !== "ethereum") {
        try {
          await setActiveNetwork(network.id);
        } catch (error) {
          console.error("Failed to restore network:", error);
          setActiveNetworkState(networks[0]);
          localStorage.setItem("activeNetworkId", networks[0].id);
        }
      }
    }
  }, []);

  const setupAuthState = useCallback(async () => {
    const isReady = await AuthService.testConnection();
    setIsFirebaseReady(isReady);

    if (AuthService.isAuthenticated()) {
      const user = AuthService.getCurrentUser();
      setWalletAddress(user?.displayName || null);
      setIsLoggedIn(true);
    }

    AuthService.onAuthStateChange((user) => {
      if (user && user.displayName) {
        setWalletAddress(user.displayName);
        setIsLoggedIn(true);
      } else {
        setWalletAddress(null);
        setIsLoggedIn(false);
      }
    });
  }, []);

  const setupWalletListeners = useCallback(() => {
    const provider = window.phantom?.ethereum || null;
    if (provider) {
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("disconnect", handleDisconnect);
    }
  }, [handleAccountsChanged, handleDisconnect]);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      await restoreSavedNetwork();
      await setupAuthState();
      setupWalletListeners();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setIsFirebaseReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [restoreSavedNetwork, setupAuthState, setupWalletListeners]);

  const cleanup = useCallback(() => {
    const provider = window.phantom?.ethereum;
    if (provider) {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("disconnect", handleDisconnect);
    }
  }, [handleAccountsChanged, handleDisconnect]);

  const setActiveNetwork = useCallback(async (networkId: string) => {
    const network = networks.find((n) => n.id === networkId);
    if (network) {
      setActiveNetworkState(network);
      localStorage.setItem("activeNetworkId", networkId);
    }
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = window.phantom?.ethereum;
      if (!provider) {
        throw new Error("Phantom wallet is not installed!");
      }

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts[0]) {
        const session = await AuthService.loginWithPhantom(accounts[0], activeNetwork.id);
        setWalletAddress(session.address);
        setIsLoggedIn(true);
        return session;
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activeNetwork.id]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();

      if (activeNetwork.id !== "ethereum") {
        try {
          await setActiveNetwork("ethereum");
        } catch (error) {
          console.error("Failed to switch back to Ethereum:", error);
        }
      }

      setWalletAddress(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activeNetwork.id, setActiveNetwork]);

  const truncatedAddress = walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}` : "";

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
