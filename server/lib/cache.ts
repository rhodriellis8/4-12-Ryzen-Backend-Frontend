type CacheEntry = {
  expiresAt: number;
  value: Buffer;
  metadata?: Record<string, unknown>;
};

const cache = new Map<string, CacheEntry>();

export const getCacheBuffer = (key: string): CacheEntry | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry;
};

export const setCacheBuffer = (key: string, value: Buffer, ttlMs: number, metadata?: Record<string, unknown>) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs, metadata });
};

