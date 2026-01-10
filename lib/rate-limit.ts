/**
 * Rate limiting utilities for API endpoints
 * Uses in-memory storage for simplicity
 * For production with multiple servers, consider Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage (consider Redis for production with multiple instances)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Custom identifier (e.g., user ID, IP address) */
  identifier: string;
}

export interface RateLimitResult {
  /** Whether the request should be allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the rate limit resets */
  resetAt: number;
  /** Total limit */
  limit: number;
}

/**
 * Check if a request should be rate limited
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { max, windowMs, identifier } = config;
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // Initialize or reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count++;
  
  const allowed = entry.count <= max;
  const remaining = Math.max(0, max - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    limit: max,
  };
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }
  
  // Fallback to a generic identifier
  return 'ip:unknown';
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };
}
