import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getByGenre,
  getGenres,
  getMovieDetails,
  getNowPlaying,
  getPopular,
  getSimilar,
  getTopRated,
  getTrending,
  getUnreleased,
  getUpcoming,
  searchMovies,
  searchMulti,
  getCollection,
  getPopularPeople,
  getPersonDetails,
  getPeopleByIds,
} from "@/services/api/tmdb";

const TOP_ACTOR_IDS = [
  500, // Tom Cruise
  6193, // Leonardo DiCaprio
  287, // Brad Pitt
  50571, // Zendaya
  1190668, // Timothée Chalamet
  72129, // Jennifer Lawrence
  234352, // Margot Robbie
  18918, // Dwayne Johnson
  1245, // Scarlett Johansson
  2888, // Will Smith
  1136406, // Tom Holland
  3223, // Robert Downey Jr.
  1373737, // Florence Pugh
  16828, // Chris Evans
  74568, // Chris Hemsworth
];

// ... (existing hooks)

export const useTopActors = () =>
  useQuery({
    queryKey: ["tmdb", "people", "top"],
    queryFn: () => getPeopleByIds(TOP_ACTOR_IDS),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

// ... (existing hooks)

export const usePopularPeople = () =>
  useQuery({
    queryKey: ["tmdb", "people", "popular"],
    queryFn: () => getPopularPeople(),
    staleTime: STALE,
  });

export const usePersonDetails = (id: number | string) =>
  useQuery({
    queryKey: ["tmdb", "person", id],
    queryFn: () => getPersonDetails(id),
    enabled: !!id,
    staleTime: STALE,
  });
import {
  getPopularTV,
  getTrendingTV,
  getTVDetails,
  getTVSeason,
  getSimilarTV,
  getTVGenres,
  getTVByGenre,
  getTVAnime,
} from "@/services/api/tvdb";

const STALE = 1000 * 60 * 10; // 10 minutes

export const useTrending = () =>
  useQuery({
    queryKey: ["tmdb", "trending"],
    queryFn: () => getTrending("week"),
    staleTime: STALE,
  });

export const usePopular = () =>
  useQuery({ queryKey: ["tmdb", "popular"], queryFn: () => getPopular(), staleTime: STALE });

export const useNowPlaying = () =>
  useQuery({ queryKey: ["tmdb", "now_playing"], queryFn: () => getNowPlaying(), staleTime: STALE });

export const useUpcoming = () =>
  useQuery({ queryKey: ["tmdb", "upcoming"], queryFn: () => getUpcoming(), staleTime: STALE });

export const useUnreleased = () =>
  useQuery({ queryKey: ["tmdb", "unreleased"], queryFn: () => getUnreleased(), staleTime: STALE });

export const useTopRated = () =>
  useQuery({ queryKey: ["tmdb", "top_rated"], queryFn: () => getTopRated(), staleTime: STALE });

export const useGenres = () =>
  useQuery({ queryKey: ["tmdb", "genres"], queryFn: () => getGenres(), staleTime: 1000 * 60 * 60 });

export const useByGenre = (genreId: number | null) =>
  useQuery({
    queryKey: ["tmdb", "by_genre", genreId],
    queryFn: () => getByGenre(genreId as number),
    enabled: genreId !== null,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useMovieDetails = (id: string) =>
  useQuery({
    queryKey: ["tmdb", "movie", id],
    queryFn: () => getMovieDetails(id),
    staleTime: STALE,
    enabled: !!id,
  });

export const useSimilar = (id: string) =>
  useQuery({
    queryKey: ["tmdb", "similar", id],
    queryFn: () => getSimilar(id),
    staleTime: STALE,
    enabled: !!id,
  });

export const useCollection = (id?: number | null) =>
  useQuery({
    queryKey: ["tmdb", "collection", id],
    queryFn: () => getCollection(id!),
    staleTime: STALE,
    enabled: !!id,
  });

export const useSearch = (query: string) =>
  useQuery({
    queryKey: ["tmdb", "search", query],
    queryFn: () => searchMulti(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

export const useTrendingTV = () =>
  useQuery({
    queryKey: ["tmdb", "trending_tv"],
    queryFn: () => getTrendingTV("week"),
    staleTime: STALE,
  });

export const usePopularTV = () =>
  useQuery({ queryKey: ["tmdb", "popular_tv"], queryFn: () => getPopularTV(), staleTime: STALE });

export const useTVDetails = (id: string) =>
  useQuery({
    queryKey: ["tmdb", "tv", id],
    queryFn: () => getTVDetails(id),
    staleTime: STALE,
    enabled: !!id,
  });

export const useTVSeason = (id: string, season: number) =>
  useQuery({
    queryKey: ["tmdb", "tv", id, "season", season],
    queryFn: () => getTVSeason(id, season),
    staleTime: STALE,
    enabled: !!id && season > 0,
  });

export const useSimilarTV = (id: string) =>
  useQuery({
    queryKey: ["tmdb", "similar_tv", id],
    queryFn: () => getSimilarTV(id),
    staleTime: STALE,
    enabled: !!id,
  });

export const useTVGenres = () =>
  useQuery({
    queryKey: ["tmdb", "tv_genres"],
    queryFn: () => getTVGenres(),
    staleTime: 1000 * 60 * 60,
  });

export const useTVByGenre = (genreId: number | null) =>
  useQuery({
    queryKey: ["tmdb", "tv_by_genre", genreId],
    queryFn: () => getTVByGenre(genreId as number),
    enabled: genreId !== null,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });

export const useTVAnime = (extraGenreId?: number | null) =>
  useQuery({
    queryKey: ["tmdb", "tv_anime", extraGenreId],
    queryFn: () => getTVAnime(extraGenreId ?? undefined),
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });
