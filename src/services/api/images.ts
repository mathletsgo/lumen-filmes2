const TMDB_IMG = "https://image.tmdb.org/t/p";

import fallbackPoster from "@/assets/poster-1.jpg";
import fallbackBackdrop from "@/assets/hero-1.jpg";

export const posterUrl = (path: string | null, size: "w300" | "w500" | "original" = "w500") =>
  path ? `${TMDB_IMG}/${size}${path}` : fallbackPoster;

export const backdropUrl = (
  path: string | null,
  size: "w780" | "w1280" | "original" = "original",
) => (path ? `${TMDB_IMG}/${size}${path}` : fallbackBackdrop);

export const profileUrl = (path: string | null, size: "w185" | "w300" = "w185") =>
  path ? `${TMDB_IMG}/${size}${path}` : "";
