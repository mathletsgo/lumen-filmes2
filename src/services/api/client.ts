// Lightweight fetch wrapper for TMDB API
// Uses v4 Read Access Token (Bearer auth)

const BASE_URL = "https://api.themoviedb.org/3";

// Em produção (Vercel): lê de process.env.TMDB_API_KEY (server-side, seguro)
// Em dev local: fallback para VITE_TMDB_API_KEY (definida no .env local)
const TOKEN =
  (typeof process !== "undefined" && process.env?.TMDB_API_KEY) ||
  (import.meta.env.VITE_TMDB_API_KEY as string | undefined);

export class TmdbError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// In-memory cache for ultra-fast instant lookups (0ms)
const memoryCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const STORAGE_PREFIX = "lumen_tmdb_v1_";

function getCached<T>(key: string): T | null {
  const now = Date.now();
  
  // 1. Check memory cache first
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > now) {
    return mem.data as T;
  }

  // 2. Check localStorage in browser
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt > now) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        } else {
          localStorage.removeItem(STORAGE_PREFIX + key);
        }
      }
    } catch {}
  }
  return null;
}

function setCached(key: string, data: any, ttl = CACHE_TTL_MS) {
  const expiresAt = Date.now() + ttl;
  const item = { data, expiresAt };
  memoryCache.set(key, item);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
    } catch {}
  }
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  init: RequestInit = {},
): Promise<T> {
  if (!TOKEN) {
    throw new TmdbError("TMDB API key não configurada (VITE_TMDB_API_KEY).", 500);
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", "pt-BR");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  const cacheKey = url.pathname + url.search;
  const isGet = !init.method || init.method.toUpperCase() === "GET";

  // Check cache for GET requests
  if (isGet) {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let msg = `TMDB request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.status_message) msg = body.status_message;
    } catch {}
    throw new TmdbError(msg, res.status);
  }

  const data = (await res.json()) as T;

  if (isGet) {
    // Genres and certifications can be cached for 24h, regular lists for 30 min
    const isGenreOrCert = path.includes("/genre/") || path.includes("/certification/");
    setCached(cacheKey, data, isGenreOrCert ? 1000 * 60 * 60 * 24 : CACHE_TTL_MS);
  }

  return data;
}
