// TMDB API types (subset)

export interface TmdbMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  runtime?: number;
  genres?: { id: number; name: string }[];
  original_language?: string;
  adult?: boolean;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
}

export interface TmdbPaginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: "YouTube" | "Vimeo" | string;
  type: "Trailer" | "Teaser" | "Clip" | string;
  official: boolean;
}

export interface TmdbCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path?: string | null;
  }[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: TmdbMovie[];
}

// Normalized Movie used across the app
export interface Movie {
  type: "movie";
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  year: number;
  releaseDate?: string;
  duration?: string;
  rating: number;
  genres: string[];
  synopsis: string;
  trailerKey?: string;
  certification?: string | null;
  collectionId?: number;
  collectionName?: string;
  cast: { id: number; name: string; role: string; photo?: string }[];
  downloads?: {
    quality: "720p" | "1080p" | "4K";
    size: string;
    language: string;
    audio: "Dublado" | "Legendado" | "Dual Áudio";
    seeders: number;
    leechers: number;
    magnet: string;
    torrent: string;
  }[];
}

export interface CastMember {
  id: number;
  name: string;
  role: string;
  photo?: string;
}

export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface WatchProviders {
  link: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  cinema?: WatchProviderItem[];
}

export interface TmdbTVShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  seasons?: TmdbSeasonSummary[];
}

export interface TmdbSeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TmdbSeason extends TmdbSeasonSummary {
  _id: string;
  episodes: TmdbEpisode[];
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime?: number;
}

export interface TVShow extends Omit<Movie, "type" | "duration"> {
  type: "tv";
  totalSeasons: number;
  totalEpisodes: number;
  status: string;
  seasons: TmdbSeasonSummary[];
}

export type MediaItem = Movie | TVShow;

export interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
}

export interface Person {
  id: number;
  name: string;
  photo: string | null;
  biography: string;
  birthday?: string;
  place_of_birth?: string;
  knownFor: string;
  movies: Movie[];
}
