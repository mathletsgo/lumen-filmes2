import { tmdbFetch } from "./client";
import type {
  TmdbCredits,
  TmdbGenre,
  TmdbPaginated,
  TmdbSeason,
  TmdbTVShow,
  TmdbVideo,
  TVShow,
} from "./types";
import { mapTmdbTV } from "./tvMappers";

let _tvGenreCache: Record<number, string> | null = null;
let _tvGenreCachePromise: Promise<Record<number, string>> | null = null;

export async function getTVGenreMap(): Promise<Record<number, string>> {
  if (_tvGenreCache) return _tvGenreCache;
  if (_tvGenreCachePromise) return _tvGenreCachePromise;
  _tvGenreCachePromise = tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list").then((data) => {
    _tvGenreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
    _tvGenreCachePromise = null;
    return _tvGenreCache;
  });
  return _tvGenreCachePromise;
}

export async function getTVGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list");
  return data.genres;
}

async function listToTVShows(list: TmdbTVShow[]): Promise<TVShow[]> {
  const genreMap = await getTVGenreMap();
  const today = new Date();
  return list
    .filter((m) => {
      const hasImagesAndTitle = !!m.poster_path && !!m.backdrop_path && !!(m.name || m.original_name);
      if (!hasImagesAndTitle) return false;
      const isUnreleased = m.first_air_date ? new Date(m.first_air_date) > today : false;
      return isUnreleased || m.vote_average > 0;
    })
    .map((m) => mapTmdbTV(m, { genreMap }));
}

export async function getTrendingTV(window: "day" | "week" = "week"): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>(`/trending/tv/${window}`);
  return listToTVShows(data.results);
}

export async function getPopularTV(page = 1): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/tv/popular", { page });
  return listToTVShows(data.results);
}

export async function getTopRatedTV(page = 1): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/tv/top_rated", { page });
  return listToTVShows(data.results);
}

export async function getTVDetails(id: string | number): Promise<TVShow> {
  const [tv, videos, credits] = await Promise.all([
    tmdbFetch<TmdbTVShow>(`/tv/${id}`),
    tmdbFetch<{ results: TmdbVideo[] }>(`/tv/${id}/videos`),
    tmdbFetch<TmdbCredits>(`/tv/${id}/credits`),
  ]);
  return mapTmdbTV(tv, { videos: videos.results, credits });
}

export async function getTVSeason(id: string | number, season: number): Promise<TmdbSeason> {
  return tmdbFetch<TmdbSeason>(`/tv/${id}/season/${season}`);
}

export async function getTVByGenre(genreId: number, page = 1): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/discover/tv", {
    with_genres: genreId,
    sort_by: "popularity.desc",
    page,
  });
  return listToTVShows(data.results);
}

export async function getTVAnime(extraGenreId?: number, page = 1): Promise<TVShow[]> {
  const params: Record<string, string | number | boolean | undefined> = {
    sort_by: "popularity.desc",
    page,
    with_original_language: "ja",
    with_genres: extraGenreId ? `16,${extraGenreId}` : "16",
  };
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/discover/tv", params);
  return listToTVShows(data.results);
}

export async function getTVByKeyword(keyword: string, page = 1): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/discover/tv", {
    with_keywords: keyword,
    sort_by: "popularity.desc",
    page,
    with_original_language: "ja",
  });
  return listToTVShows(data.results);
}

export async function getSimilarTV(id: string | number): Promise<TVShow[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>(`/tv/${id}/similar`);
  return listToTVShows(data.results);
}
