import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rate-limit';

describe('checkRateLimit', () => {
  const TEST_PREFIX = 'test-' + Date.now();

  beforeEach(() => {
    resetRateLimit('test-user', TEST_PREFIX);
  });

  it('allows first request', () => {
    const result = checkRateLimit('user-1', { maxRequests: 3, windowMs: 60000, prefix: TEST_PREFIX });
    expect(result.allowed).toBe(true);
  });

  it('allows up to max requests', () => {
    const config = { maxRequests: 3, windowMs: 60000, prefix: TEST_PREFIX };
    expect(checkRateLimit('user-2', config).allowed).toBe(true);
    expect(checkRateLimit('user-2', config).allowed).toBe(true);
    expect(checkRateLimit('user-2', config).allowed).toBe(true);
  });

  it('blocks after max requests exceeded', () => {
    const config = { maxRequests: 2, windowMs: 60000, prefix: TEST_PREFIX };
    checkRateLimit('user-3', config);
    checkRateLimit('user-3', config);
    const blocked = checkRateLimit('user-3', config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks different users independently', () => {
    const config = { maxRequests: 1, windowMs: 60000, prefix: TEST_PREFIX };
    expect(checkRateLimit('user-a', config).allowed).toBe(true);
    expect(checkRateLimit('user-b', config).allowed).toBe(true);
    expect(checkRateLimit('user-a', config).allowed).toBe(false);
  });
});
