'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { base } from "wagmi/chains";
import { walletConnect } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Lazy-create config only when Web3Provider is actually rendered
let wagmiConfig: ReturnType<typeof createConfig> | null = null;
let queryClientInstance: QueryClient | null = null;

// Custom storage that doesn't persist - prevents auto-reconnect on page load
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function getWagmiConfig() {
  if (!wagmiConfig) {
    const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('WalletConnect Project ID is required. Set NEXT_PUBLIC_WC_PROJECT_ID or NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.');
    }

    wagmiConfig = createConfig({
      chains: [base],
      connectors: [
        walletConnect({
          projectId,
          showQrModal: true,
          metadata: {
            name: "Mental Wealth Academy",
            description: "Mental Wealth Academy - A platform for mental health and wellness",
            url: typeof window !== 'undefined' ? window.location.origin : '',
            icons: [],
          },
        }),
      ],
      transports: {
        [base.id]: http(
          process.env.NEXT_PUBLIC_ALCHEMY_ID
            ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
            : 'https://mainnet.base.org',
        ),
      },
      // Disable automatic reconnection on page load - user must click to connect
      storage: createStorage({ storage: noopStorage }),
      ssr: true,
    });
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
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
