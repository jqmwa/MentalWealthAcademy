'use client';

import { useEffect, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  useEffect(() => {
    // Call ready() immediately to hide the splash screen
    // This must be called as soon as the app is ready to be displayed
    sdk.actions.ready().catch((error) => {
      // Silently fail if not in mini app context (expected behavior)
      // Only log unexpected errors
      if (process.env.NODE_ENV === 'development') {
        console.log('Mini app SDK ready() called (may fail if not in mini app context)');
      }
    });
  }, []);

  return <>{children}</>;
}
