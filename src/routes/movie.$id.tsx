import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Download,
  Heart,
  Star,
  ArrowLeft,
  Share2,
  Magnet,
  Users,
  ArrowDown,
  Languages,
  HardDrive,
  Copy,
  Check,
  Play,
  Clock,
  Sparkles,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFavorites } from "@/lib/favorites";
import { MovieRow } from "@/components/MovieRow";
import { MovieRowSkeleton } from "@/components/Skeletons";
import { WatchButton } from "@/components/MovieWatchButton";
import { useMovieDetails, useSimilar, useCollection } from "@/hooks/useTmdb";
import { AgeBadge } from "@/components/AgeBadge";
import type { Movie } from "@/services/api/types";
import { useServerFn } from "@tanstack/react-start";
import { incrementView } from "@/services/dbService";
import { ReviewsSection } from "@/components/ReviewsSection";

export const Route = createFileRoute("/movie/$id")({
  head: () => ({
    meta: [
      { title: "Filme — Lumen" },
      { name: "description", content: "Detalhes do filme no Lumen." },
    ],
  }),
  component: MoviePage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <div>
          <p className="text-destructive">{error.message}</p>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-4 px-5 py-2 rounded-full gradient-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center px-4">
      <div>
        <h2 className="text-3xl font-bold">Filme não encontrado</h2>
        <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-full gradient-primary">
          Voltar
        </Link>
      </div>
    </div>
  ),
});

function MoviePage() {
  const { id } = Route.useParams();
  const { data: movie, isLoading, error } = useMovieDetails(id);
  const { data: similar } = useSimilar(id);
  const { data: collection } = useCollection(movie?.collectionId);
  const { has, toggle } = useFavorites();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [views, setViews] = useState(0);
  const [shared, setShared] = useState(false);

  const incrementViewFn = useServerFn(incrementView);

  useEffect(() => {
    let mounted = true;
    incrementViewFn({ data: { movieId: id } }).then((res) => {
      if (mounted && res.success) {
        setViews(res.views as number);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id, incrementViewFn]);

  if (isLoading) {
    return (
      <div className="pt-32 px-4 sm:px-12 max-w-screen-xl mx-auto space-y-6">
        <div className="h-[60vh] w-full rounded-3xl bg-muted/40 animate-pulse" />
        <div className="h-10 w-2/3 bg-muted/40 animate-pulse rounded" />
        <div className="h-32 w-full bg-muted/40 animate-pulse rounded" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <div>
          <h2 className="text-3xl font-bold">Filme não encontrado</h2>
          <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-full gradient-primary">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const fav = has(movie.id);

  return (
    <article>
      {/* Cinematic backdrop */}
      <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          src={movie.backdrop}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        <Link
          to="/"
          className="absolute top-24 left-6 sm:left-12 inline-flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-foreground/10 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </section>

      <div className="relative z-10 -mt-64 sm:-mt-80 max-w-screen-xl mx-auto px-4 sm:px-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hidden lg:block aspect-[2/3] rounded-2xl overflow-hidden shadow-elevated"
          >
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-shadow-cinema">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full glass-strong font-semibold">
                <Star className="w-4 h-4 fill-accent text-accent" />
                {movie.rating.toFixed(1)} TMDB
              </span>
              {views > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-strong font-semibold text-primary">
                  <Eye className="w-4 h-4" />
                  {views}
                </span>
              )}
              {movie.year && <span className="text-muted-foreground">{movie.year}</span>}
              {movie.duration && <span className="text-muted-foreground">{movie.duration}</span>}
              {movie.certification && <AgeBadge code={movie.certification} size="sm" />}
              {movie.genres.map((g) => (
                <Link
                  key={g}
                  to="/categories"
                  className="px-3 py-1 rounded-full glass text-xs hover:bg-primary/20 transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            <p className="mt-6 text-base sm:text-lg text-foreground/85 max-w-3xl leading-relaxed">
              {movie.synopsis}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <WatchButton id={movie.id} mediaType="movie" />
              {movie.trailerKey && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold hover:bg-foreground/10 transition-colors"
                >
                  <Play className="w-5 h-5" /> Trailer
                </button>
              )}
              <button
                onClick={() => toggle(movie.id)}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold transition-all ${fav
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "glass-strong hover:bg-foreground/10"
                  }`}
              >
                <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
                {fav ? "Favoritado" : "Favoritar"}
              </button>
              <button
                onClick={() => {
                  setShared(true);
                  setTimeout(() => setShared(false), 2000);
                  navigator.clipboard.writeText(window.location.href).catch(() => { });
                  if (navigator.share) {
                    navigator.share({ title: movie.title, url: window.location.href }).catch(() => { });
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold hover:bg-foreground/10 transition-colors"
              >
                {shared ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                {shared ? "Copiado!" : "Compartilhar"}
              </button>
            </div>

            {/* Downloads */}
            {/* <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">Opções de download</h3>
              <div className="grid gap-3">
                {movie.downloads.map((d, i) => (
                  <DownloadRow key={i} d={d} />
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                * Dados de seeders e leechers atualizados continuamente. Use um cliente compatível com BitTorrent.
              </p>
            </div> */}

            {/* Cast */}
            {movie.cast.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">Elenco principal</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {movie.cast.map((c) => (
                    <Link
                      key={c.id}
                      to="/person/$id"
                      params={{ id: String(c.id) }}
                      className="p-4 rounded-2xl glass hover:bg-primary/10 transition-colors block"
                    >
                      <div className="w-14 h-14 rounded-full gradient-primary grid place-items-center font-bold text-lg shadow-glow overflow-hidden shrink-0">
                        {c.photo ? (
                          <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          c.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <p className="mt-3 font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.role}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Saga / Coleção */}
        {collection && collection.length > 1 && (
          <div className="mt-16 -mx-4 sm:-mx-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
            <MovieRow
              title={`Maratone a saga completa: ${movie.collectionName || "A Coleção"}`}
              movies={collection}
            />
          </div>
        )}

        {/* Avaliações */}
        <ReviewsSection movieId={id} />

        {/* Similar */}
        <div className="mt-16 -mx-4 sm:-mx-12">
          {!similar ? (
            <MovieRowSkeleton title="Você também pode gostar" />
          ) : similar.length > 0 ? (
            <MovieRow title="Você também pode gostar" movies={similar} />
          ) : null}
        </div>
      </div>

      {/* Trailer modal */}
      {trailerOpen && movie.trailerKey && (
        <div
          onClick={() => setTrailerOpen(false)}
          className="fixed inset-0 z-[80] bg-background/90 backdrop-blur-xl grid place-items-center p-4"
        >
          <div
            className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title="Trailer"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </article>
  );
}

type Dl = NonNullable<Movie["downloads"]>[number];

function DownloadRow({ d }: { d: Dl }) {
  const [copied, setCopied] = useState(false);
  const copyMagnet = async () => {
    try {
      await navigator.clipboard.writeText(d.magnet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { }
  };
  const qualityColor =
    d.quality === "4K"
      ? "from-accent to-primary"
      : d.quality === "1080p"
        ? "from-primary to-accent"
        : "from-muted-foreground/40 to-muted-foreground/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative p-4 sm:p-5 rounded-2xl glass-strong hover:bg-primary/5 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`px-3 py-1.5 rounded-lg bg-gradient-to-br ${qualityColor} text-primary-foreground text-sm font-bold shadow-glow shrink-0`}
        >
          {d.quality}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm flex-1 min-w-0">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <HardDrive className="w-4 h-4" /> {d.size}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Languages className="w-4 h-4" /> {d.language} · {d.audio}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ArrowDown className="w-4 h-4" /> {d.seeders.toLocaleString()} seeders
          </span>
          <span className="flex items-center gap-1.5 text-orange-400">
            <Users className="w-4 h-4" /> {d.leechers.toLocaleString()} leechers
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyMagnet}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full glass text-xs font-medium hover:bg-foreground/10 transition-colors"
            aria-label="Copiar magnet"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <a
            href={d.magnet}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass hover:bg-primary/20 text-sm font-medium transition-colors"
          >
            <Magnet className="w-4 h-4" /> Magnet
          </a>
          <a
            href={d.torrent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-semibold shadow-glow hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4" /> Torrent
          </a>
        </div>
      </div>
    </motion.div>
  );
}
