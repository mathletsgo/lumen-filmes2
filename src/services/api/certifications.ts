import { tmdbFetch } from "./client";

export type CertificationCode = "L" | "10" | "12" | "14" | "16" | "18" | string;

interface ReleaseDatesResponse {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string; type: number; release_date: string }[];
  }[];
}

/**
 * Fetches age certification for a movie.
 * Prefers Brazilian rating (BR), falls back to US.
 */
export async function getCertification(id: string | number): Promise<CertificationCode | null> {
  try {
    const data = await tmdbFetch<ReleaseDatesResponse>(`/movie/${id}/release_dates`);
    const br = data.results.find((r) => r.iso_3166_1 === "BR");
    const pickFrom = (entries: ReleaseDatesResponse["results"][number] | undefined) =>
      entries?.release_dates.find((d) => d.certification && d.certification.trim())
        ?.certification ?? null;

    const brCert = pickFrom(br);
    if (brCert) return normalizeBR(brCert);

    const us = data.results.find((r) => r.iso_3166_1 === "US");
    const usCert = pickFrom(us);
    if (usCert) return mapUsToBR(usCert);

    return null;
  } catch {
    return null;
  }
}

export async function getTVCertification(id: string | number): Promise<CertificationCode | null> {
  try {
    const data = await tmdbFetch<{ results: { iso_3166_1: string; rating: string }[] }>(`/tv/${id}/content_ratings`);
    const br = data.results.find((r) => r.iso_3166_1 === "BR");
    if (br?.rating) return normalizeBR(br.rating);

    const us = data.results.find((r) => r.iso_3166_1 === "US");
    if (us?.rating) return mapUsToBR(us.rating);

    return null;
  } catch {
    return null;
  }
}

function normalizeBR(c: string): CertificationCode {
  const s = c.trim().toUpperCase();
  if (s === "L" || s === "AL" || s === "ER") return "L";
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (n <= 10) return "10";
    if (n <= 12) return "12";
    if (n <= 14) return "14";
    if (n <= 16) return "16";
    return "18";
  }
  return s;
}

function mapUsToBR(c: string): CertificationCode | null {
  const s = c.trim().toUpperCase();
  switch (s) {
    case "G":
    case "TV-Y":
    case "TV-G":
      return "L";
    case "PG":
    case "TV-Y7":
    case "TV-PG":
      return "10";
    case "PG-13":
    case "TV-14":
      return "14";
    case "R":
      return "16";
    case "NC-17":
    case "TV-MA":
      return "18";
    default:
      return null;
  }
}
