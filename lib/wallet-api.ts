/**
 * Helper function to create wallet authentication headers
 * This should be used in client components that need to make authenticated API calls
 * 
 * @param address - The wallet address
 * @param signMessageAsync - Function to sign a message (from wagmi's useSignMessage hook)
 * @returns Promise with Authorization header
 * 
 * @example
 * ```tsx
 * import { useAccount, useSignMessage } from 'wagmi';
 * import { getWalletAuthHeaders } from '@/lib/wallet-api';
 * 
 * const { address } = useAccount();
 * const { signMessageAsync } = useSignMessage();
 * 
 * const headers = await getWalletAuthHeaders(address, signMessageAsync);
 * ```
 */
export async function getWalletAuthHeaders(
  address: string | undefined,
  signMessageAsync?: any // wagmi v2 SignMessageMutateAsync type
): Promise<HeadersInit> {
  if (!address) {
    return {};
  }

  // If no signMessageAsync function provided, use legacy format (development only)
  if (!signMessageAsync) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Wallet Auth] Using legacy format without signature - update to use signMessageAsync');
      return {
        'Authorization': `Bearer ${address}`,
      };
    }
    // In production, require signature
    throw new Error('Signature required for wallet authentication');
  }

  // Create signed authentication token
  try {
    const timestamp = Date.now().toString();
    const message = `Sign in to Mental Wealth Academy\n\nWallet: ${address}\nTimestamp: ${timestamp}`;
    
    // Call wagmi's signMessageAsync with proper parameters
    const signature = await signMessageAsync({ message });
    const token = `${address}:${signature}:${timestamp}`;
    
    return {
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.error('[Wallet Auth] Failed to sign message:', error);
    throw new Error('Failed to create authentication token');
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getWalletAuthHeaders with signMessage instead
 */
export function getWalletAuthHeadersLegacy(address: string | undefined): HeadersInit {
  if (!address) {
    return {};
  }
  if (process.env.NODE_ENV !== 'development') {
    console.error('[Wallet Auth] Legacy auth not supported in production');
    return {};
  }
  return {
    'Authorization': `Bearer ${address}`,
  };
}
