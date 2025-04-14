import { useEffect } from "react";
import { useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

export function useNetworkCheck() {
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        // Try to switch to Base network
        await switchChain({ chainId: base.id });
      } catch (error) {
        console.error("Failed to switch to Base network:", error);
      }
    };

    // Check network on mount
    checkNetwork();

    // Set up an interval to check network periodically
    const interval = setInterval(checkNetwork, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [switchChain]);
}
