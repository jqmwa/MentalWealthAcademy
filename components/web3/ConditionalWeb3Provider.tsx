'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Web3Provider } from './Web3Provider';

/**
 * Conditionally wraps children with Web3Provider only on pages that need wallet functionality.
 * The landing page (/) should NOT have Web3Provider to avoid blocking login with wallet connections.
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
