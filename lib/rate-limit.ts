type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function isRateLimited(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > limit) {
    return true;
  }
  return false;
}

export function resetRateLimit(key: string) {
  store.delete(key);
}