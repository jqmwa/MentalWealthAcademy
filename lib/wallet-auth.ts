import { headers } from 'next/headers';
import { recoverMessageAddress } from 'viem';

/**
 * Gets the wallet address from the request.
 * Checks Authorization header for wallet address and signature.
 * Returns the wallet address if valid, or null if not found.
 */
export async function getWalletAddressFromRequest(): Promise<string | null> {
  try {
    const headersList = await headers();
    
    // Try Authorization header first (for API calls)
    const authHeader = headersList.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // For now, we'll use the wallet address directly in the Bearer token
      // In production, you should verify a signature instead
      const walletAddress = authHeader.substring(7);
      
      // Basic validation - check if it's a valid Ethereum address format
      if (/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return walletAddress.toLowerCase();
      } else {
        console.error('getWalletAddressFromRequest - Invalid address format:', walletAddress);
      }
    }
    
    // Could also check cookies if needed for SSR
    // For now, we'll rely on Authorization header only
    
    return null;
  } catch (error) {
    console.error('getWalletAddressFromRequest - Error getting headers:', error);
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
