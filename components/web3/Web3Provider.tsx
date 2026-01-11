'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from '@coinbase/onchainkit';

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
    wagmiConfig = createConfig({
      chains: [base],
      connectors: [
        coinbaseWallet({
          appName: "Mental Wealth Academy",
          // Enable Smart Wallet (no browser extension required)
          preference: 'smartWalletOnly',
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
        <OnchainKitProvider
          chain={base}
          apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''}
          config={{
            wallet: {
              preference: 'smartWalletOnly', // Only Coinbase Smart Wallet
              display: 'modal',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
