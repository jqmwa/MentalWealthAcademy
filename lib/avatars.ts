/**
 * Avatar System with Deterministic Selection
 * 
 * This module provides:
 * - 555 avatar records with IPFS-hosted images
 * - Deterministic seeded RNG (Mulberry32)
 * - Function to get 5 unique avatars for any user seed
 * 
 * The same user seed will ALWAYS return the same 5 avatars.
 */

// IPFS gateway configuration
const IPFS_GATEWAY = 'https://peach-impossible-chicken-451.mypinata.cloud/ipfs';
const COLLECTION_CID = 'bafybeieww32fskd7h3f7x3v2pk6y4raplotzeeojag7pwhoket5yrbxdgi';

// Total number of avatars in the collection
const TOTAL_AVATARS = 555;

// Number of avatars to assign per user
const AVATARS_PER_USER = 5;

/**
 * Avatar interface representing a single avatar
 */
export interface Avatar {
  id: string;           // Unique avatar identifier (e.g., "avatar_001")
  image_url: string;    // Full IPFS gateway URL for the image
  metadata_url: string; // Full IPFS gateway URL for metadata JSON
}

/**
 * Mulberry32 - A fast, high-quality 32-bit seeded PRNG
 * 
 * This is a deterministic random number generator that:
 * - Always produces the same sequence for the same seed
 * - Has good statistical properties for our use case
 * - Is simple and efficient
 * 
 * @param seed - A 32-bit integer seed
 * @returns A function that returns the next random float [0, 1)
 */
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Converts a string to a 32-bit integer hash
 * 
 * Uses a simple but effective hash function (djb2 variant)
 * to convert any string (user_id, wallet address, etc.) to a seed.
 * 
 * @param str - The string to hash
 * @returns A 32-bit integer suitable for seeding the RNG
 */
function stringToSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + char
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  return hash;
}

/**
 * Generates avatar data for a given avatar index
 * 
 * @param index - Zero-based avatar index (0-554)
 * @returns Avatar object with id and IPFS URLs
 */
function getAvatarById(index: number): Avatar {
  // Avatar IDs are 1-indexed and zero-padded to 3 digits
  const avatarNumber = index + 1;
  const paddedNumber = avatarNumber.toString().padStart(3, '0');
  const id = `avatar_${paddedNumber}`;
  
  // Construct IPFS URLs
  // Images are stored as: {CID}/{number}.png
  // Metadata is stored as: {CID}/metadata/{number}.json
  const image_url = `${IPFS_GATEWAY}/${COLLECTION_CID}/${avatarNumber}.png`;
  const metadata_url = `${IPFS_GATEWAY}/${COLLECTION_CID}/metadata/${avatarNumber}.json`;
  
  return {
    id,
    image_url,
    metadata_url,
  };
}

/**
 * Gets exactly 5 deterministically assigned avatars for a user
 * 
 * CRITICAL: This function MUST return the same 5 avatars for the same userSeed.
 * This is enforced by using a seeded PRNG.
 * 
 * Algorithm:
 * 1. Convert userSeed to a 32-bit hash
 * 2. Initialize Mulberry32 RNG with that hash
 * 3. Select 5 unique random indices from 0-554
 * 4. Return corresponding avatar objects
 * 
 * @param userSeed - A stable user identifier (user_id or wallet address)
 * @returns Array of exactly 5 Avatar objects
 */
export function getAssignedAvatars(userSeed: string): Avatar[] {
  // Convert user identifier to numeric seed
  const seed = stringToSeed(userSeed);
  
  // Initialize deterministic RNG
  const rng = mulberry32(seed);
  
  // Set to track selected indices (ensures uniqueness)
  const selectedIndices = new Set<number>();
  
  // Select 5 unique avatar indices
  // Loop is bounded by the fact that 5 << 555, so collisions are rare
  while (selectedIndices.size < AVATARS_PER_USER) {
    // Generate random index in range [0, TOTAL_AVATARS)
    const index = Math.floor(rng() * TOTAL_AVATARS);
    selectedIndices.add(index);
  }
  
  // Convert indices to Avatar objects
  const avatars: Avatar[] = [];
  for (const index of selectedIndices) {
    avatars.push(getAvatarById(index));
  }
  
  // Sort by ID for consistent ordering
  avatars.sort((a, b) => a.id.localeCompare(b.id));
  
  return avatars;
}

/**
 * Validates that an avatar ID is in the user's assigned set
 * 
 * This MUST be called server-side to prevent avatar spoofing.
 * 
 * @param userSeed - The user's stable identifier
 * @param avatarId - The avatar ID to validate
 * @returns true if the avatar is valid for this user, false otherwise
 */
export function isAvatarValidForUser(userSeed: string, avatarId: string): boolean {
  const assignedAvatars = getAssignedAvatars(userSeed);
  return assignedAvatars.some(avatar => avatar.id === avatarId);
}

/**
 * Gets a single avatar by its ID
 * 
 * @param avatarId - The avatar ID (e.g., "avatar_017")
 * @returns Avatar object or null if invalid ID
 */
export function getAvatarByAvatarId(avatarId: string): Avatar | null {
  // Parse the numeric part from the ID
  const match = avatarId.match(/^avatar_(\d{3})$/);
  if (!match) {
    return null;
  }
  
  const avatarNumber = parseInt(match[1], 10);
  if (avatarNumber < 1 || avatarNumber > TOTAL_AVATARS) {
    return null;
  }
  
  return getAvatarById(avatarNumber - 1);
}

/**
 * Constants exported for use in other modules
 */
export const AVATAR_CONFIG = {
  TOTAL_AVATARS,
  AVATARS_PER_USER,
  IPFS_GATEWAY,
  COLLECTION_CID,
} as const;

