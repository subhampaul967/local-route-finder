import type { RouteDTO } from "../types";

const CACHE_KEY = "route-search-cache-v1";

interface CacheEntry {
  key: string;
  routes: RouteDTO[];
  timestamp: number;
}

interface CacheStore {
  entries: CacheEntry[];
}

const MAX_ENTRIES = 20;

const isBrowser = typeof window !== "undefined";

const readStore = (): CacheStore => {
  if (!isBrowser) return { entries: [] };
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as CacheStore;
    if (!Array.isArray(parsed.entries)) return { entries: [] };
    return parsed;
  } catch {
    return { entries: [] };
  }
};

const writeStore = (store: CacheStore) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota or serialization errors
  }
};

export const saveSearchToCache = (key: string, routes: RouteDTO[]) => {
  const store = readStore();
  const filtered = store.entries.filter((e) => e.key !== key);
  filtered.unshift({ key, routes, timestamp: Date.now() });

  if (filtered.length > MAX_ENTRIES) {
    filtered.length = MAX_ENTRIES;
  }

  writeStore({ entries: filtered });
};

export const getCachedSearch = (
  key: string
): { routes: RouteDTO[] } | null => {
  const store = readStore();
  const found = store.entries.find((e) => e.key === key);
  if (!found) return null;
  return { routes: found.routes };
};
