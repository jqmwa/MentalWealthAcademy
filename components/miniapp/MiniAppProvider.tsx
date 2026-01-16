'use client';

import { useEffect, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  useEffect(() => {
    // Initialize the mini app SDK
    const initializeMiniApp = async () => {
      try {
        // Notify the mini app platform that the app is ready to be displayed
        await sdk.actions.ready();
        console.log('Mini app SDK initialized successfully');
      } catch (error) {
        console.error('Error initializing mini app SDK:', error);
        // App will still work normally if not in mini app context
      }
    };

    initializeMiniApp();
  }, []);

  return <>{children}</>;
}
