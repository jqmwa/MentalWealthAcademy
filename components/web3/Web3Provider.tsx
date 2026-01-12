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
        // Your dApps chains
        chains: [base],
        transports: {
          // RPC URL for each chain
          [base.id]: http(
            process.env.NEXT_PUBLIC_ALCHEMY_ID
              ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
              : 'https://mainnet.base.org',
          ),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',

        // Required App Info
        appName: "Mental Wealth Academy",

        // Optional App Info
        appDescription: "Mental Wealth Academy - A platform for mental health and wellness",
        appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://mentalwealth.academy',
        appIcon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : 'https://mentalwealth.academy/favicon.ico',
      }),
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
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
