import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Star, Heart, Share2, Play, Clock, Calendar, Check } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { MovieRow } from "@/components/MovieRow";
import { MovieRowSkeleton } from "@/components/Skeletons";
import { WatchButton } from "@/components/MovieWatchButton";
import { EpisodeBrowser } from "@/components/EpisodeBrowser";
import { useTVDetails, useSimilarTV } from "@/hooks/useTmdb";
import { AgeBadge } from "@/components/AgeBadge";

export const Route = createFileRoute("/tv/$id")({
  head: () => ({
    meta: [
      { title: "Série — Lumen" },
      { name: "description", content: "Detalhes da série no Lumen." },
    ],
  }),
  component: TVPage,
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
        <h2 className="text-3xl font-bold">Série não encontrada</h2>
        <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-full gradient-primary">
          Voltar
        </Link>
      </div>
    </div>
  ),
});

function TVPage() {
  const { id } = Route.useParams();
  const { data: tv, isLoading, error } = useTVDetails(id);
  const { data: similar } = useSimilarTV(id);
  const { has, toggle } = useFavorites();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const fav = has(id);

  if (isLoading) {
    return (
      <div className="pt-32 px-4 sm:px-12 max-w-screen-xl mx-auto space-y-6">
        <div className="h-[60vh] w-full rounded-3xl bg-muted/40 animate-pulse" />
        <div className="h-10 w-2/3 bg-muted/40 animate-pulse rounded" />
        <div className="h-32 w-full bg-muted/40 animate-pulse rounded" />
      </div>
    );
  }

  if (error || !tv) {
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <div>
          <h2 className="text-3xl font-bold">Série não encontrada</h2>
          {error && (
            <p className="text-sm text-destructive/80 mt-2 max-w-md">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          )}
          <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-full gradient-primary">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article>
      <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          src={tv.backdrop}
          alt={tv.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        <Link
          to="/"
          className="absolute top-24 left-6 sm:left-12 inline-flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-foreground/10 transition-colors text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Voltar
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
            <img src={tv.poster} alt={tv.title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="min-w-0 flex-1"
          >
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-shadow-cinema">
              {tv.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full glass-strong font-semibold">
                <Star className="w-4 h-4 fill-accent text-accent" />
                {tv.rating.toFixed(1)} TMDB
              </span>
              {tv.year && <span className="text-muted-foreground">{tv.year}</span>}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {tv.totalSeasons} {tv.totalSeasons === 1 ? "temporada" : "temporadas"}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {tv.totalEpisodes} episódios
              </span>
              {tv.certification && <AgeBadge code={tv.certification} size="sm" />}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: "oklch(0.7 0.27 340 / 25%)",
                  color: "oklch(0.85 0.18 340)",
                  border: "1px solid oklch(0.7 0.27 340 / 30%)",
                }}
              >
                {tv.status}
              </span>
              {tv.genres.map((g) => (
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
              {tv.synopsis}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <WatchButton id={id} mediaType="tv" />
              {tv.trailerKey && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold hover:bg-foreground/10 transition-colors"
                >
                  <Play className="w-5 h-5" /> Trailer
                </button>
              )}
              <button
                onClick={() => toggle(id)}
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
                    navigator.share({ title: tv.title, url: window.location.href }).catch(() => { });
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold hover:bg-foreground/10 transition-colors"
              >
                {shared ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                {shared ? "Copiado!" : "Compartilhar"}
              </button>
            </div>

            <EpisodeBrowser tvId={id} seasons={tv.seasons} />

            {tv.cast.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">Elenco principal</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {tv.cast.map((c) => (
                    <Link
                      key={c.id}
                      to="/person/$id"
                      params={{ id: String(c.id) }}
                      className="p-4 rounded-2xl glass hover:bg-primary/10 transition-colors block"
                    >
                      <div className="w-14 h-14 rounded-full gradient-primary grid place-items-center font-bold text-lg shadow-glow overflow-hidden shrink-0">
                        {c.photo ? (
                          <img src={c.photo} alt={c.name || ""} className="w-full h-full object-cover" />
                        ) : (
                          (c.name || "?")
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

        <div className="mt-16 -mx-4 sm:-mx-12">
          {!similar ? (
            <MovieRowSkeleton title="Séries similares" />
          ) : similar.length > 0 ? (
            <MovieRow title="Séries similares" movies={similar as any} />
          ) : null}
        </div>
      </div>

      {trailerOpen && tv.trailerKey && (
        <div
          onClick={() => setTrailerOpen(false)}
          className="fixed inset-0 z-[80] bg-background/90 backdrop-blur-xl grid place-items-center p-4"
        >
          <div
            className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${tv.trailerKey}?autoplay=1`}
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
