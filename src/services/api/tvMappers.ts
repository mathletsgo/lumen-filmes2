import type { TmdbCredits, TmdbTVShow, TmdbVideo, TVShow } from "./types";
import { backdropUrl, posterUrl } from "./images";

export function mapTmdbTV(
  m: TmdbTVShow,
  opts: {
    genreMap?: Record<number, string>;
    videos?: TmdbVideo[];
    credits?: TmdbCredits;
  } = {},
): TVShow {
  const genres =
    m.genres?.map((g) => g.name) ??
    (m.genre_ids?.map((id) => opts.genreMap?.[id]).filter(Boolean) as string[]) ??
    [];

  const trailer = opts.videos?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
  );

  const cast =
    opts.credits?.cast.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.character || "Elenco",
      photo: c.profile_path ? posterUrl(c.profile_path) : undefined,
    })) ?? [];

  const director = opts.credits?.crew.find((c) => c.job === "Director");
  if (director)
    cast.push({
      id: director.id,
      name: director.name,
      role: "Direção",
      photo: director.profile_path ? posterUrl(director.profile_path) : undefined,
    });

  return {
    type: "tv",
    id: String(m.id),
    title: m.name || m.original_name || "Sem título",
    poster: posterUrl(m.poster_path),
    backdrop: backdropUrl(m.backdrop_path),
    year: m.first_air_date ? Number(m.first_air_date.slice(0, 4)) : 0,
    rating: Math.round(m.vote_average * 10) / 10,
    genres,
    synopsis: m.overview || "Sinopse não disponível.",
    trailerKey: trailer?.key,
    totalSeasons: m.number_of_seasons ?? 0,
    totalEpisodes: m.number_of_episodes ?? 0,
    status: m.status ?? "",
    seasons: m.seasons ?? [],
    cast,
  };
}
