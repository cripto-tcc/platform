import { ref, computed } from "vue";
import ethereumIcon from "../assets/ethereum.svg";
import polygonIcon from "../assets/polygon.svg";

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

export function useUserContext() {
  const setActiveNetwork = (networkId: string) => {
    const network = networks.find((n) => n.id === networkId);
    if (network) {
      activeNetwork.value = network;
    }
  };

  const setWalletAddress = (address: string | null) => {
    walletAddress.value = address;
    isLoggedIn.value = !!address;
  };

  const login = (address: string) => {
    setWalletAddress(address);
  };

  const logout = () => {
    setWalletAddress(null);
    activeNetwork.value = networks[0];
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
    truncatedAddress,
    setActiveNetwork,
    setWalletAddress,
    login,
    logout,
  };
}
