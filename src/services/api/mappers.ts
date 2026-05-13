import type { Movie, TmdbCredits, TmdbMovie, TmdbVideo } from "./types";
import { backdropUrl, posterUrl } from "./images";

const mockDownloads = (id: number): Movie["downloads"] => {
  const seed = Number(id) % 900;
  return [
    {
      quality: "1080p",
      size: "2.1 GB",
      language: "Português",
      audio: "Dublado",
      seeders: 1200 + seed,
      leechers: 80 + (seed % 60),
      magnet: `magnet:?xt=urn:btih:LUMEN${id}1080DUB&dn=Movie`,
      torrent: "#",
    },
    {
      quality: "1080p",
      size: "2.0 GB",
      language: "Inglês",
      audio: "Legendado",
      seeders: 900 + seed,
      leechers: 50 + (seed % 40),
      magnet: `magnet:?xt=urn:btih:LUMEN${id}1080LEG&dn=Movie`,
      torrent: "#",
    },
    {
      quality: "4K",
      size: "8.4 GB",
      language: "Inglês",
      audio: "Dual Áudio",
      seeders: 380 + (seed % 200),
      leechers: 30 + (seed % 30),
      magnet: `magnet:?xt=urn:btih:LUMEN${id}4K&dn=Movie`,
      torrent: "#",
    },
    {
      quality: "720p",
      size: "950 MB",
      language: "Português",
      audio: "Dublado",
      seeders: 2000 + seed,
      leechers: 130 + (seed % 80),
      magnet: `magnet:?xt=urn:btih:LUMEN${id}720&dn=Movie`,
      torrent: "#",
    },
  ];
};

const formatDuration = (mins?: number) => {
  if (!mins || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
};

export function mapTmdbMovie(
  m: TmdbMovie,
  opts: {
    genreMap?: Record<number, string>;
    videos?: TmdbVideo[];
    credits?: TmdbCredits;
    certification?: string | null;
  } = {},
): Movie {
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
    type: "movie" as const,
    id: String(m.id),
    title: m.title || m.original_title || "Sem título",
    poster: posterUrl(m.poster_path),
    backdrop: backdropUrl(m.backdrop_path),
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : 0,
    releaseDate: m.release_date || "",
    duration: formatDuration(m.runtime),
    rating: Math.round(m.vote_average * 10) / 10,
    genres,
    synopsis: m.overview || "Sinopse não disponível.",
    trailerKey: trailer?.key,
    certification: opts.certification ?? null,
    collectionId: m.belongs_to_collection?.id,
    collectionName: m.belongs_to_collection?.name,
    cast,
    downloads: mockDownloads(m.id),
  };
}
