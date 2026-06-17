type RateLimitEntry = {
  tokens: number;
  lastRefill: number;
};

const limitMap = new Map<string, RateLimitEntry>();

const LIMIT = 5; // Maximum 5 requests allowed
const REFILL_RATE_MS = 30 * 1000; // Refill 1 token every 30 seconds

/**
 * Basic memory-based token-bucket rate limiter.
 * Prevents rapid brute-force requests per client IP.
 */
export function isRateLimited(ip: string): boolean {
  if (process.env.NODE_ENV !== "production") {
    return false; // Bypass rate limiting in development to enable smooth testing
  }

  const now = Date.now();
  let entry = limitMap.get(ip);

  if (!entry) {
    entry = { tokens: LIMIT, lastRefill: now };
    limitMap.set(ip, entry);
  }

  // Calculate tokens to refill
  const elapsed = now - entry.lastRefill;
  if (elapsed > REFILL_RATE_MS) {
    const refillTokens = Math.floor(elapsed / REFILL_RATE_MS);
    entry.tokens = Math.min(LIMIT, entry.tokens + refillTokens);
    entry.lastRefill = now;
  }

  if (entry.tokens > 0) {
    entry.tokens -= 1;
    limitMap.set(ip, entry);
    return false;
  }

  console.warn(`[Rate Limit] Client IP ${ip} has exceeded the request threshold.`);
  return true;
}
