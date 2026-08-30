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
import { ANIME_GENRE_ID, ADULT_GENRE_ID } from "./tmdb";

let _tvGenreCache: Record<number, string> | null = null;
let _tvGenreCachePromise: Promise<Record<number, string>> | null = null;

export async function getTVGenreMap(): Promise<Record<number, string>> {
  if (_tvGenreCache) return _tvGenreCache;
  if (_tvGenreCachePromise) return _tvGenreCachePromise;
  _tvGenreCachePromise = tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list").then((data) => {
    _tvGenreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
    _tvGenreCache[ANIME_GENRE_ID] = "Anime";
    _tvGenreCache[ADULT_GENRE_ID] = "18+";
    _tvGenreCachePromise = null;
    return _tvGenreCache;
  });
  return _tvGenreCachePromise;
}

export async function getTVGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list");
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

const MOVIE_TO_TV_GENRE_MAP: Record<number, string | number> = {
  28: 10759, // Action -> Action & Adventure
  12: 10759, // Adventure -> Action & Adventure
  878: 10765, // Sci-Fi -> Sci-Fi & Fantasy
  14: 10765, // Fantasy -> Sci-Fi & Fantasy
  10752: 10768, // War -> War & Politics
  27: "9648|80|10765", // Horror -> Mystery | Crime | Sci-Fi & Fantasy
  53: "9648|80", // Thriller -> Mystery | Crime
  36: "99|18", // History -> Documentary | Drama
  10402: "10767|10764|18", // Music
  10749: "18|10766", // Romance -> Drama | Soap
  10770: 18, // TV Movie -> Drama
};

export interface TVDiscoverOptions {
  page?: number;
  sortBy?: "popularity.desc" | "vote_average.desc" | "first_air_date.desc";
  minVotes?: number;
  withOriginalLanguage?: string;
  withAnimation?: boolean;
}

export async function getTVByGenre(genreId: number, options: TVDiscoverOptions = {}): Promise<TVShow[]> {
  const { page = 1, sortBy = "popularity.desc", minVotes = 10, withOriginalLanguage, withAnimation } = options;

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
    const tvGenre = MOVIE_TO_TV_GENRE_MAP[genreId] ?? genreId;
    params.with_genres = `16,${tvGenre}`;
  } else {
    const tvGenre = MOVIE_TO_TV_GENRE_MAP[genreId] ?? genreId;
    params.with_genres = tvGenre;
  }

  let data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/discover/tv", params);

  // Fallback if strict parameters returned no items
  if (data.results.length === 0) {
    if (genreId === ADULT_GENRE_ID) {
      params.certification_country = "US";
      params.certification = "TV-MA";
      params["vote_count.gte"] = 1;
      data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/discover/tv", params);
    } else if (minVotes > 1) {
      params["vote_count.gte"] = 1;
      data = await tmdbFetch<TmdbPaginated<TmdbTVShow>>("/discover/tv", params);
    }
  }

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
