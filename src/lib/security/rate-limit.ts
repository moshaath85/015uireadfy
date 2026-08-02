const windows = new Map<string, { count: number; resetAt: number }>();

function pruneExpired(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  windows.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      expiredKeys.push(key);
    }
  });
  for (let i = 0; i < expiredKeys.length; i++) {
    windows.delete(expiredKeys[i]);
  }
}

function getWindowKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

export interface RateLimitConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly prefix: string;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 3600000,
  prefix: "contact",
};

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const { maxRequests, windowMs, prefix } = { ...DEFAULT_CONFIG, ...config };
  const key = getWindowKey(prefix, identifier);
  const now = Date.now();

  pruneExpired();

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count++;

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimit(identifier: string, prefix = "contact"): void {
  const key = getWindowKey(prefix, identifier);
  windows.delete(key);
}
