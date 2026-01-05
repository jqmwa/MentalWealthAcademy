'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Lazy-create config only when Web3Provider is actually rendered
let wagmiConfig: ReturnType<typeof createConfig> | null = null;
let queryClientInstance: QueryClient | null = null;

function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = createConfig(
      getDefaultConfig({
        // Your dApps chains - using Base mainnet
        chains: [base],
        transports: {
          // RPC URL for Base mainnet
          [base.id]: http(
            process.env.NEXT_PUBLIC_ALCHEMY_ID
              ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
              : undefined,
          ),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

        // Required App Info
        appName: "Mental Wealth Academy",
        appDescription: "Mental Wealth Academy is a virtual learning platform for the next generation.",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://mentalwealthacademy.world",
        appIcon: `${process.env.NEXT_PUBLIC_APP_URL || "https://mentalwealthacademy.world"}/icons/favicon.png`,
      })
    );
  }
  return wagmiConfig;
}

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient();
  }
  return queryClientInstance;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => getWagmiConfig(), []);
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
