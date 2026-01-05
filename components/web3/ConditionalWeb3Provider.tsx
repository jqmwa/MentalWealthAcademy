'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

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
 * The landing page (/) should NOT have Web3Provider to avoid loading wagmi/connectkit dependencies.
 */
export function ConditionalWeb3Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that should NOT have Web3Provider (no wallet functionality needed)
  const excludedPaths = ['/'];
  
  // Only wrap with Web3Provider if not on excluded paths
  if (excludedPaths.includes(pathname)) {
    return <>{children}</>;
  }
  
  return <Web3Provider>{children}</Web3Provider>;
}
