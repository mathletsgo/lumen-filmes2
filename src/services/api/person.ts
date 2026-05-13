import { tmdbFetch } from "./client";
import { posterUrl } from "./images";

interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  also_known_as: string[];
}

interface TmdbCastCredit {
  id: number;
  title?: string;
  name?: string;
  character: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface TmdbCreditsResponse {
  cast: TmdbCastCredit[];
}

export interface PersonDetails {
  id: number;
  name: string;
  photo: string;
  bio: string;
  birthday: string;
  deathday: string | null;
  birthplace: string;
  knownFor: string;
  alsoKnownAs: string[];
}

export async function getPersonDetails(id: string | number): Promise<PersonDetails> {
  const data = await tmdbFetch<TmdbPerson>(`/person/${id}`);
  return {
    id: data.id,
    name: data.name,
    photo: posterUrl(data.profile_path, "w500"),
    bio: data.biography || "Biografia não disponível.",
    birthday: data.birthday || "",
    deathday: data.deathday || null,
    birthplace: data.place_of_birth || "",
    knownFor: data.known_for_department || "",
    alsoKnownAs: data.also_known_as || [],
  };
}

interface PersonCredits {
  cast: {
    id: number;
    title: string;
    character: string;
    poster: string;
    year: number;
    mediaType: "movie" | "tv";
  }[];
}

function mapCredit(c: TmdbCastCredit, type: "movie" | "tv") {
  return {
    id: c.id,
    title: c.title || c.name || "Sem título",
    character: c.character || "",
    poster: posterUrl(c.poster_path),
    year: c.release_date
      ? Number(c.release_date.slice(0, 4))
      : c.first_air_date
        ? Number(c.first_air_date.slice(0, 4))
        : 0,
    mediaType: type as "movie" | "tv",
  };
}

export async function getPersonCredits(id: string | number): Promise<PersonCredits> {
  const [movies, tv] = await Promise.all([
    tmdbFetch<TmdbCreditsResponse>(`/person/${id}/movie_credits`),
    tmdbFetch<TmdbCreditsResponse>(`/person/${id}/tv_credits`),
  ]);

  const allCredits = [
    ...movies.cast.map((c) => mapCredit(c, "movie")),
    ...tv.cast.map((c) => mapCredit(c, "tv")),
  ];

  allCredits.sort((a, b) => b.year - a.year);

  return { cast: allCredits };
}
