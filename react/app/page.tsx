"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { CircularProgress, Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import ConnectWalletModal from "./components/ConnectWalletModal";
import PriceView from "./components/price";
import QuoteView from "./components/quote";
import { useNetworkCheck } from "./hooks/useNetworkCheck";
import type { PriceResponse } from "../src/utils/types";

export default function Page() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId() || 1;
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<PriceResponse | undefined>();
  const [quote, setQuote] = useState();

  useNetworkCheck();

  useEffect(() => {
    // Simulate Firebase initialization
    const timer = setTimeout(() => {
      setIsFirebaseReady(true);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isFirebaseReady) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: 9999,
        }}
      >
        <CircularProgress size={64} sx={{ color: "#0d0b1c" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#0d0b1c" }}>
      <Sidebar />
      {/*
      
      {isConnected ? (
        <Box component="main" sx={{ flex: 1, ml: "272px" }}>
          {finalize && price ? (
            <QuoteView taker={address} price={price} quote={quote} setQuote={setQuote} chainId={chainId} />
          ) : (
            <PriceView taker={address} price={price} setPrice={setPrice} setFinalize={setFinalize} chainId={chainId} />
          )}
        </Box>
      ) : (
        <ConnectWalletModal />
      )}
      */}
      <ConnectWalletModal />
    </Box>
  );
}
