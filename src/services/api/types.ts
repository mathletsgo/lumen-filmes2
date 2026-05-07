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
  belongs_to_collection?: { id: number; name: string; poster_path: string | null; backdrop_path: string | null } | null;
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
  cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
  crew: { id: number; name: string; job: string; department: string; profile_path?: string | null }[];
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
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  year: number;
  duration: string;
  rating: number;
  genres: string[];
  synopsis: string;
  trailerKey?: string;
  certification?: string | null;
  collectionId?: number;
  collectionName?: string;
  cast: { name: string; role: string; photo?: string }[];
  downloads: {
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
