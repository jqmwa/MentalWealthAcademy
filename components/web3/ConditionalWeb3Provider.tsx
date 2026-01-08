'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { WalletErrorBoundary } from './WalletErrorBoundary';

// Dynamically import Web3Provider ONLY when needed (not on landing page)
// Using Next.js dynamic() with ssr: false to completely avoid loading on landing page
const Web3Provider = dynamic(
  () => import('./Web3Provider').then(mod => ({ default: mod.Web3Provider })),
  { 
    ssr: false,
    loading: () => null,
    // Add error boundary for import failures
    onError: (error) => {
      console.error('Failed to load Web3Provider:', error);
    },
  }
);

// Add a fallback component
const Web3ProviderFallback = ({ children }: { children: React.ReactNode }) => {
  console.warn('Web3Provider failed to load, rendering without wallet functionality');
  return <>{children}</>;
};

/**
 * Conditionally wraps children with Web3Provider only on pages that need wallet functionality.
 * The landing page (/) now needs Web3Provider for wallet connection functionality.
 */
export function ConditionalWeb3Provider({ children }: { children: React.ReactNode }) {
  // Always wrap with Web3Provider since landing page now needs wallet functionality
  // Wrap in error boundary to catch Family wallet errors
  return (
    <WalletErrorBoundary>
      <Web3Provider>{children}</Web3Provider>
    </WalletErrorBoundary>
  );
}
