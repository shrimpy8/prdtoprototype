/**
 * Simple in-memory rate limiter for API routes
 * Prevents API abuse by limiting requests per IP address
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimit = new Map<string, RateLimitRecord>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function pruneExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimit) {
    if (now > record.resetTime) {
      rateLimit.delete(ip);
    }
  }
}

/**
 * Check if an IP address is within rate limits
 * @param ip - Client IP address
 * @param requests - Maximum number of requests allowed (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  ip: string,
  requests: number = 100,
  windowMs: number = 60000
): boolean {
  pruneExpiredEntries();
  const now = Date.now();

  const record = rateLimit.get(ip);

  // No record or window expired - allow and create new record
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Too many requests - rate limited
  if (record.count >= requests) {
    return false;
  }

  // Within limits - increment and allow
  record.count++;
  return true;
}

/**
 * Get client IP address from request headers
 * @param request - Request object
 * @returns Client IP address or 'unknown'
 */
export function getClientIP(request: Request): string {
  // Take the LAST IP in x-forwarded-for — the one added by our own proxy,
  // not the first which is client-controlled and trivially spoofable.
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[ips.length - 1];
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}
