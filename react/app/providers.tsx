"use client";

import * as React from "react";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, phantomWallet } from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { Inter } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
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
            <ThemeProvider theme={theme}>
              <div className={inter.className}>{children}</div>
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}
