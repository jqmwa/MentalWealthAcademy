import { headers } from 'next/headers';
import { recoverMessageAddress } from 'viem';

/**
 * Gets the wallet address from the request.
 * Checks Authorization header for wallet address with signed message proof.
 * Format: "Bearer <address>:<signature>:<timestamp>"
 * Returns the wallet address if valid, or null if not found.
 */
export async function getWalletAddressFromRequest(): Promise<string | null> {
  try {
    const headersList = await headers();
    
    // Try Authorization header first (for API calls)
    const authHeader = headersList.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const authData = authHeader.substring(7);
      
      // Expected format: address:signature:timestamp
      const parts = authData.split(':');
      
      if (parts.length === 3) {
        const [walletAddress, signature, timestamp] = parts;
        
        // Basic validation - check if it's a valid Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
          // SECURITY: Don't log the invalid address (could be malicious input)
          console.error('getWalletAddressFromRequest - Invalid address format');
          return null;
        }
        
        // Check timestamp is recent (within 5 minutes)
        const timestampNum = parseInt(timestamp, 10);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (isNaN(timestampNum) || Math.abs(now - timestampNum) > fiveMinutes) {
          console.error('getWalletAddressFromRequest - Timestamp expired or invalid');
          return null;
        }
        
        // Verify signature
        const message = `Sign in to Mental Wealth Academy\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
        const isValid = await verifyWalletSignature(message, signature, walletAddress);
        
        if (isValid) {
          return walletAddress.toLowerCase();
        } else {
          // SECURITY: Log security event without sensitive data
          console.warn('getWalletAddressFromRequest - Signature verification failed');
          return null;
        }
      }
      
      // Fallback: Legacy format (single wallet address) - DEPRECATED, will be removed
      // Only allow in development mode
      if (process.env.NODE_ENV === 'development' && /^0x[a-fA-F0-9]{40}$/.test(authData)) {
        console.warn('Using legacy wallet auth format - please update to use signature');
        return authData.toLowerCase();
      }
    }
    
    return null;
  } catch (error) {
    console.error('getWalletAddressFromRequest - Error:', error);
    return null;
  }
}

/**
 * Verifies a message signature from a wallet address.
 * This should be used to verify that the user owns the wallet.
 */
export async function verifyWalletSignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });
    
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Failed to verify wallet signature:', error);
    return false;
  }
}
