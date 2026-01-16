// Scatter API utilities for minting

// Scatter collection configuration
export const SCATTER_COLLECTION_SLUG = 'academic-angels'

export interface CollectionInfo {
  address: string
  chainId: number
  slug: string
  name: string
  // Add other fields as needed
}

export interface MintList {
  id: string
  root: string
  address: string
  name: string
  currency_address: string
  currency_symbol: string
  token_price: string
  decimals: number
  start_time: string
  end_time: string | null
  wallet_limit: number
  list_limit: number
  unit_size: number
  created_at: string
  updated_at: string
}

export interface MintTransaction {
  to: string
  value: string
  data: string
}

export interface ERC20Approval {
  address: string
  amount: string
}

export interface MintResponse {
  mintTransaction: MintTransaction
  erc20s: ERC20Approval[]
}

/**
 * Fetch collection information
 * Falls back to environment variable if API doesn't return address
 */
export async function getCollectionInfo(collectionSlug: string): Promise<CollectionInfo> {
  try {
    const response = await fetch(`https://api.scatter.art/v1/collection/${collectionSlug}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collection info: ${response.statusText}`)
    }

    const data = await response.json()
    
    // If API returns address, use it
    if (data.address) {
      return {
        address: data.address,
        chainId: data.chainId || 8453, // Default to Base if not provided
        slug: collectionSlug,
        name: data.name || 'Academic Angels',
      }
    }
    
    throw new Error('Collection address not found in API response')
  } catch (error) {
    // Fallback to environment variable
    const fallbackAddress = process.env.NEXT_PUBLIC_SCATTER_COLLECTION_ADDRESS
    const fallbackChainId = process.env.NEXT_PUBLIC_SCATTER_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_SCATTER_CHAIN_ID) : 8453
    
    if (fallbackAddress) {
      return {
        address: fallbackAddress,
        chainId: fallbackChainId,
        slug: collectionSlug,
        name: 'Academic Angels',
      }
    }
    
    throw new Error('Collection address not available. Please set NEXT_PUBLIC_SCATTER_COLLECTION_ADDRESS environment variable.')
  }
}

/**
 * Fetch eligible mint lists for a user
 */
export async function getEligibleInviteLists({
  collectionSlug,
  walletAddress,
}: {
  collectionSlug: string
  walletAddress?: string
}): Promise<MintList[]> {
  const url = `https://api.scatter.art/v1/collection/${collectionSlug}/eligible-invite-lists${
    walletAddress ? `?walletAddress=${walletAddress}` : ''
  }`

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mint lists: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Get mint transaction from Scatter API
 */
export async function getMintTransaction({
  collectionAddress,
  chainId,
  minterAddress,
  lists,
  affiliateAddress,
}: {
  collectionAddress: string
  chainId: number
  minterAddress: string
  lists: { id: string; quantity: number }[]
  affiliateAddress?: string
}): Promise<MintResponse> {
  const response = await fetch('https://api.scatter.art/v1/mint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionAddress,
      chainId,
      minterAddress,
      lists,
      affiliateAddress,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get mint transaction: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data
}
