'use client';

import { useEffect, ReactNode, useLayoutEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useBaseKitAutoSignin } from './useBaseKitAutoSignin';

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  // Auto-sign in BaseKit users
  const { isBaseKit, walletAddress, isSigningIn } = useBaseKitAutoSignin();

  // Use useLayoutEffect to call ready() synchronously before paint
  // This ensures the splash screen is hidden as early as possible
  useLayoutEffect(() => {
    // Capture frame context and CSP violation info
    const frameInfo = (() => {
      try {
        const isTopFrame = window === window.top;
        const currentOrigin = window.location.origin;
        let parentOrigin = null;
        try {
          parentOrigin = window.parent.location.origin;
        } catch (e) {
          parentOrigin = 'blocked-by-csp';
        }
        return {isTopFrame, currentOrigin, parentOrigin, userAgent: navigator.userAgent.substring(0, 50)};
      } catch (e) {
        return {error: String(e)};
      }
    })();
    
    // #region agent log
    fetch('http://127.0.0.1:1050/ingest/32dcef63-6d25-4009-a29b-e3432272eb4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MiniAppProvider.tsx:17',message:'MiniAppProvider component rendered/mounted - useLayoutEffect started',data:{timestamp:Date.now(),sdkAvailable:!!sdk,hasChildren:!!children,...frameInfo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion agent log
    
    // Call ready() immediately to hide the splash screen
    // This must be called as soon as the app is ready to be displayed
    const readyPromise = sdk.actions.ready();
    
    // #region agent log
    fetch('http://127.0.0.1:1050/ingest/32dcef63-6d25-4009-a29b-e3432272eb4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MiniAppProvider.tsx:23',message:'sdk.actions.ready() called - promise created',data:{timestamp:Date.now(),promiseCreated:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion agent log
    
    // Await the promise to ensure it completes
    (async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:1050/ingest/32dcef63-6d25-4009-a29b-e3432272eb4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MiniAppProvider.tsx:29',message:'Before awaiting sdk.actions.ready()',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion agent log
        
        await readyPromise;
        
        // #region agent log
        fetch('http://127.0.0.1:1050/ingest/32dcef63-6d25-4009-a29b-e3432272eb4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MiniAppProvider.tsx:35',message:'sdk.actions.ready() resolved successfully',data:{timestamp:Date.now(),success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion agent log
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:1050/ingest/32dcef63-6d25-4009-a29b-e3432272eb4c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MiniAppProvider.tsx:41',message:'sdk.actions.ready() rejected/errored',data:{timestamp:Date.now(),error:String(error),errorType:error instanceof Error ? error.constructor.name : typeof error,success:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion agent log
        
        // Silently fail if not in mini app context (expected behavior)
        // Only log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[MiniApp] SDK ready() called (may fail if not in mini app context):', error);
        }
      }
    })();
  }, []);

  return <>{children}</>;
}
