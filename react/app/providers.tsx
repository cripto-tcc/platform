"use client";

import * as React from "react";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, phantomWallet } from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

// Configure Base network
const baseConfig = {
  ...base,
  rpcUrls: {
    ...base.rpcUrls,
    default: { http: ["https://mainnet.base.org"] },
    public: { http: ["https://mainnet.base.org"] },
  },
};

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended Wallet",
      wallets: [phantomWallet],
    },
    {
      groupName: "Other",
      wallets: [phantomWallet, metaMaskWallet],
    },
  ],
  {
    appName: "0x Swap Demo App",
    projectId,
  }
);

const config = createConfig({
  chains: [baseConfig],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors,
  ssr: true,
  transports: { [baseConfig.id]: http() },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider initialChain={baseConfig} locale="en-US">
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}
