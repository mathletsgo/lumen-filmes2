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

  return res.json() as Promise<T>;
}
