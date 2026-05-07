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
  getUpcoming,
  searchMovies,
  getCollection,
} from "@/services/api/tmdb";

const STALE = 1000 * 60 * 10; // 10 minutes

export const useTrending = () =>
  useQuery({ queryKey: ["tmdb", "trending"], queryFn: () => getTrending("week"), staleTime: STALE });

export const usePopular = () =>
  useQuery({ queryKey: ["tmdb", "popular"], queryFn: () => getPopular(), staleTime: STALE });

export const useNowPlaying = () =>
  useQuery({ queryKey: ["tmdb", "now_playing"], queryFn: () => getNowPlaying(), staleTime: STALE });

export const useUpcoming = () =>
  useQuery({ queryKey: ["tmdb", "upcoming"], queryFn: () => getUpcoming(), staleTime: STALE });

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
    queryFn: () => searchMovies(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
