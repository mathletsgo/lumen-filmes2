// TMDB endpoint functions — clean, focused, typed.

import { tmdbFetch } from "./client";
import type {
  Movie,
  Person,
  TmdbCredits,
  TmdbGenre,
  TmdbMovie,
  TmdbPaginated,
  TmdbPerson,
  TmdbVideo,
  WatchProviders,
} from "./types";

// ... (existing functions)

export async function getPopularPeople(page = 1): Promise<TmdbPerson[]> {
  const [data1, data2] = await Promise.all([
    tmdbFetch<TmdbPaginated<TmdbPerson>>("/person/popular", { page }),
    tmdbFetch<TmdbPaginated<TmdbPerson>>("/person/popular", { page: page + 1 }),
  ]);
  const combined = [...data1.results, ...data2.results];
  const seen = new Set<number>();
  return combined.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return !!p.profile_path && (p.known_for_department === "Acting" || !p.known_for_department);
  });
}

export async function getPersonDetails(id: number | string): Promise<Person> {
  const [person, credits] = await Promise.all([
    tmdbFetch<TmdbPerson>(`/person/${id}`),
    tmdbFetch<{ cast: TmdbMovie[] }>(`/person/${id}/movie_credits`),
  ]);
  const { mapTmdbPerson } = await import("./mappers");
  return mapTmdbPerson(person, credits);
}

export async function getPeopleByIds(ids: number[]): Promise<TmdbPerson[]> {
  const people = await Promise.all(
    ids.map((id) => tmdbFetch<TmdbPerson>(`/person/${id}`))
  );
  return people;
}
import { mapTmdbMovie } from "./mappers";
import { getCertification } from "./certifications";

export const ANIME_GENRE_ID = 210024;
export const ADULT_GENRE_ID = 181818;

let _genreCache: Record<number, string> | null = null;
let _genreCachePromise: Promise<Record<number, string>> | null = null;

export async function getGenreMap(): Promise<Record<number, string>> {
  if (_genreCache) return _genreCache;
  if (_genreCachePromise) return _genreCachePromise;
  _genreCachePromise = tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list").then((data) => {
    _genreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
    _genreCache[ANIME_GENRE_ID] = "Anime";
    _genreCache[ADULT_GENRE_ID] = "18+";
    _genreCachePromise = null;
    return _genreCache;
  });
  return _genreCachePromise;
}

export async function getGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");
  const genres = [...data.genres];
  if (!genres.some((g) => g.id === ANIME_GENRE_ID || g.name.toLowerCase() === "anime")) {
    const animIndex = genres.findIndex((g) => g.id === 16);
    const animeGenre: TmdbGenre = { id: ANIME_GENRE_ID, name: "Anime" };
    if (animIndex !== -1) {
      genres.splice(animIndex + 1, 0, animeGenre);
    } else {
      genres.unshift(animeGenre);
    }
  }
  if (!genres.some((g) => g.id === ADULT_GENRE_ID || g.name === "18+")) {
    genres.push({ id: ADULT_GENRE_ID, name: "18+" });
  }
  return genres;
}

async function listToMovies(list: TmdbMovie[]): Promise<Movie[]> {
  const genreMap = await getGenreMap();
  const today = new Date();
  return list
    .filter((m) => {
      const hasImagesAndTitle = !!m.poster_path && !!m.backdrop_path && !!(m.title || m.original_title);
      if (!hasImagesAndTitle) return false;
      const isUnreleased = m.release_date ? new Date(m.release_date) > today : false;
      return isUnreleased || m.vote_average > 0;
    })
    .map((m) => mapTmdbMovie(m, { genreMap }));
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

export async function getUnreleased(page = 1): Promise<Movie[]> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/discover/movie", {
    "primary_release_date.gte": today,
    sort_by: "popularity.desc",
    page,
  });
  return listToMovies(data.results);
}

export interface DiscoverOptions {
  page?: number;
  sortBy?: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
  minVotes?: number;
  withOriginalLanguage?: string;
  withAnimation?: boolean;
}

export async function getByGenre(genreId: number, options: DiscoverOptions = {}): Promise<Movie[]> {
  const { page = 1, sortBy = "popularity.desc", minVotes = 30, withOriginalLanguage, withAnimation } = options;
  const params: Record<string, string | number | boolean | undefined> = {
    sort_by: sortBy,
    page,
    "vote_count.gte": minVotes,
    include_adult: false,
  };

  if (withOriginalLanguage) {
    params.with_original_language = withOriginalLanguage;
  }

  if (genreId === ADULT_GENRE_ID) {
    params.certification_country = "BR";
    params.certification = "18";
    params.include_adult = true;
  } else if (genreId === ANIME_GENRE_ID) {
    params.with_genres = 16;
    params.with_original_language = "ja";
  } else if (withAnimation) {
    params.with_genres = `16,${genreId}`;
  } else {
    params.with_genres = genreId;
  }

  let data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/discover/movie", params);

  // Fallback if strict parameters returned no items
  if (data.results.length === 0) {
    if (genreId === ADULT_GENRE_ID) {
      params.certification_country = "US";
      params.certification = "R";
      params["vote_count.gte"] = 1;
      data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/discover/movie", params);
    } else if (minVotes > 1) {
      params["vote_count.gte"] = 1;
      data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/discover/movie", params);
    }
  }

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

export async function searchMulti(query: string, page = 1): Promise<import("./types").MediaItem[]> {
  const term = query.trim();
  if (!term) return [];
  const data = await tmdbFetch<TmdbPaginated<any>>("/search/multi", {
    query: term,
    page,
    include_adult: false,
  });

  const [movieGenreMap, tvGenreMap] = await Promise.all([
    getGenreMap(),
    import("./tvdb").then((m) => m.getTVGenreMap()),
  ]);

  const { mapTmdbTV } = await import("./tvMappers");

  const today = new Date();

  return data.results
    .filter((item: any) => {
      const hasImagesAndTitle = !!item.poster_path && !!item.backdrop_path && !!(item.title || item.original_title || item.name || item.original_name);
      if (!hasImagesAndTitle) return false;
      const dateStr = item.release_date || item.first_air_date;
      const isUnreleased = dateStr ? new Date(dateStr) > today : false;
      return isUnreleased || item.vote_average > 0;
    })
    .map((item: any) => {
      if (item.media_type === "movie") {
        return mapTmdbMovie(item, { genreMap: movieGenreMap });
      } else if (item.media_type === "tv") {
        return mapTmdbTV(item, { genreMap: tvGenreMap });
      }
      return null;
    })
    .filter(Boolean) as import("./types").MediaItem[];
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

export async function getWatchProviders(
  id: string | number,
  mediaType: "movie" | "tv" = "movie",
): Promise<WatchProviders | null> {
  try {
    const data = await tmdbFetch<{
      id: number;
      results: Record<string, WatchProviders>;
    }>(`/${mediaType}/${id}/watch/providers`);
    return data.results?.BR ?? null;
  } catch {
    return null;
  }
}
