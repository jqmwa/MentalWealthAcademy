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
    loading: () => null, // No loading state needed
  }
);

/**
 * Conditionally wraps children with Web3Provider only on pages that need wallet functionality.
 * The landing page (/) does not need Web3Provider.
 */
export function ConditionalWeb3Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Skip Web3Provider on landing page to avoid family accounts runtime error
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <WalletErrorBoundary>
      <Web3Provider>{children}</Web3Provider>
    </WalletErrorBoundary>
  );
}
