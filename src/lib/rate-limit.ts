// Simple in-memory rate limiter for auth endpoints
// Tracks requests per IP, prevents brute-force attacks

const windowMs = 15 * 60 * 1000; // 15 minutes
const maxAttempts = 10; // max 10 attempts per IP per 15 min

type Attempt = { count: number; resetAt: number };
const store = new Map<string, Attempt>();

export function rateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(ip);
    }
  }, 5 * 60 * 1000);
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}
