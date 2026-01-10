/**
 * Client-side wallet authentication utilities
 * Use this to create signed authentication tokens for API requests
 */

import { signMessage } from 'viem/accounts';

/**
 * Create an authentication token for wallet-based API requests
 * @param walletAddress The user's wallet address
 * @param signMessageFn Function to sign a message (from wallet provider)
 * @returns Authentication token in format: "address:signature:timestamp"
 */
export async function createWalletAuthToken(
  walletAddress: string,
  signMessageFn: (message: string) => Promise<string>
): Promise<string> {
  const timestamp = Date.now().toString();
  const message = `Sign in to Mental Wealth Academy\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
  
  try {
    const signature = await signMessageFn(message);
    return `${walletAddress}:${signature}:${timestamp}`;
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw new Error('Failed to create authentication token');
  }
}

/**
 * Create Authorization header for API requests
 * @param walletAddress The user's wallet address
 * @param signMessageFn Function to sign a message (from wallet provider)
 * @returns Object with Authorization header
 */
export async function createWalletAuthHeader(
  walletAddress: string,
  signMessageFn: (message: string) => Promise<string>
): Promise<{ Authorization: string }> {
  const token = await createWalletAuthToken(walletAddress, signMessageFn);
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Example usage with wagmi/viem:
 * 
 * ```typescript
 * import { useSignMessage, useAccount } from 'wagmi';
 * import { createWalletAuthHeader } from '@/lib/wallet-auth-client';
 * 
 * function MyComponent() {
 *   const { address } = useAccount();
 *   const { signMessageAsync } = useSignMessage();
 * 
 *   async function callProtectedAPI() {
 *     if (!address) return;
 *     
 *     const headers = await createWalletAuthHeader(address, signMessageAsync);
 *     
 *     const response = await fetch('/api/protected-endpoint', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         ...headers,
 *       },
 *       body: JSON.stringify({ data: 'your data' }),
 *     });
 *     
 *     return response.json();
 *   }
 * }
 * ```
 */
