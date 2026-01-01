/**
 * Helper function to get wallet address for API authentication
 * This should be used in client components that need to make authenticated API calls
 */
export function getWalletAuthHeaders(address: string | undefined): HeadersInit {
  if (!address) {
    return {};
  }
  return {
    'Authorization': `Bearer ${address}`,
  };
}
