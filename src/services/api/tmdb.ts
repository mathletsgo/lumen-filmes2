// TMDB endpoint functions — clean, focused, typed.

import { tmdbFetch } from "./client";
import type {
  Movie,
  TmdbCredits,
  TmdbGenre,
  TmdbMovie,
  TmdbPaginated,
  TmdbVideo,
} from "./types";
import { mapTmdbMovie } from "./mappers";
import { getCertification } from "./certifications";

let _genreCache: Record<number, string> | null = null;

export async function getGenreMap(): Promise<Record<number, string>> {
  if (_genreCache) return _genreCache;
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");
  _genreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
  return _genreCache;
}

export async function getGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");
  return data.genres;
}

async function listToMovies(list: TmdbMovie[]): Promise<Movie[]> {
  const genreMap = await getGenreMap();
  return list.map((m) => mapTmdbMovie(m, { genreMap }));
}

export async function getTrending(window: "day" | "week" = "week"): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>(`/trending/movie/${window}`);
  return listToMovies(data.results);
}

export async function getPopular(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/popular", { page });
  return listToMovies(data.results);
}

export async function getNowPlaying(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/now_playing", { page });
  return listToMovies(data.results);
}

export async function getUpcoming(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/upcoming", { page });
  return listToMovies(data.results);
}

export async function getTopRated(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/top_rated", { page });
  return listToMovies(data.results);
}

export async function getByGenre(genreId: number, page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/discover/movie", {
    with_genres: genreId,
    sort_by: "popularity.desc",
    page,
  });
  return listToMovies(data.results);
}

export async function searchMovies(query: string, page = 1): Promise<Movie[]> {
  const term = query.trim();
  if (!term) return [];
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/search/movie", {
    query: term,
    page,
    include_adult: false,
  });
  return listToMovies(data.results);
}

export async function getMovieDetails(id: string | number): Promise<Movie> {
  const [movie, videos, credits, certification] = await Promise.all([
    tmdbFetch<TmdbMovie>(`/movie/${id}`),
    tmdbFetch<{ results: TmdbVideo[] }>(`/movie/${id}/videos`),
    tmdbFetch<TmdbCredits>(`/movie/${id}/credits`),
    getCertification(id),
  ]);
  return mapTmdbMovie(movie, { videos: videos.results, credits, certification });
}

export async function getSimilar(id: string | number): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>(`/movie/${id}/similar`);
  return listToMovies(data.results);
}

export async function getCollection(id: string | number): Promise<Movie[]> {
  const data = await tmdbFetch<import("./types").TmdbCollection>(`/collection/${id}`);
  return listToMovies(data.parts);
}
