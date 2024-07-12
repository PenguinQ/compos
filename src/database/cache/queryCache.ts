import { LRUCache } from 'lru-cache';

type CacheItem<T> = {
  data: T;
  lastFetched: number;
  staleTime: number;
};

const query_cache = new LRUCache<string, CacheItem<any>>({
  max: 100,
});

export const set = (key: string, data: any, staleTime: number, cacheTime: number): void => {
  query_cache.set(key, {
    data,
    staleTime,
    lastFetched: Date.now(),
  }, {
    ttl: cacheTime,
  });
};

export const get = (key: string): { data?: any; isStale: boolean; } => {
  const item = query_cache.get(key);

  if (!item) return { data: undefined, isStale: true };

  const isStale = item.staleTime === 0 || Date.now() - item.lastFetched > item.staleTime

  return { data: item.data, isStale}
};

export const del = (key: string): void => {
  query_cache.delete(key);
};

export const clear = (): void => {
  query_cache.clear();
};

export const queryCache = { set, get, del, clear };
