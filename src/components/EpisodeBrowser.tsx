import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTVSeason } from "@/hooks/useTmdb";
import { backdropUrl, posterUrl } from "@/services/api/images";
import type { TmdbSeasonSummary, TmdbEpisode } from "@/services/api/types";

interface Props {
  tvId: string;
  seasons: TmdbSeasonSummary[];
}

function SeasonTab({
  season,
  isActive,
  onClick,
}: {
  season: TmdbSeasonSummary;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
        isActive
          ? "bg-primary text-primary-foreground shadow-glow"
          : "glass hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
      }`}
    >
      {season.name}
    </button>
  );
}

function EpisodeCard({ episode, onClick }: { episode: TmdbEpisode; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="shrink-0 w-full sm:w-56 lg:w-64 sm:snap-start group text-left"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/40 mb-2.5 shadow-card group-hover:shadow-elevated transition-shadow duration-300">
        {episode.still_path ? (
          <img
            src={backdropUrl(episode.still_path, "w780")}
            alt={episode.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/20">
            <Play className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm grid place-items-center shadow-glow">
            <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>

        {episode.runtime && (
          <div
            className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ background: "oklch(0 0 0 / 70%)", backdropFilter: "blur(4px)" }}
          >
            {episode.runtime}m
          </div>
        )}
      </div>

      <div className="flex items-start gap-2">
        <span className="text-[11px] sm:text-xs font-bold text-primary min-w-[1.2rem] sm:min-w-[1.5rem] leading-5">
          {episode.episode_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-tight line-clamp-1">{episode.name}</p>
          {episode.air_date && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(episode.air_date).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function EpisodeSheet({
  episode,
  open,
  onClose,
}: {
  episode: TmdbEpisode | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!episode) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl"
          >
            <div className="relative">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 pb-0">
                <div className="w-6" />
                <div className="w-12 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
                <button
                  onClick={onClose}
                  className="w-8 h-8 grid place-items-center rounded-full glass hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-6">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-elevated mb-5">
                  {episode.still_path ? (
                    <img
                      src={backdropUrl(episode.still_path, "w780")}
                      alt={episode.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/20">
                      <Play className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-primary/90 backdrop-blur-sm text-xs font-bold text-primary-foreground">
                      EP {episode.episode_number}
                    </div>
                    {episode.runtime && (
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm"
                        style={{ background: "oklch(0 0 0 / 60%)" }}
                      >
                        <Clock className="w-3 h-3" />
                        {episode.runtime}m
                      </div>
                    )}
                  </div>

                  <button className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm grid place-items-center shadow-glow">
                      <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                    </div>
                  </button>
                </div>

                <h2 className="text-xl font-bold mb-1">{episode.name}</h2>

                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
                  {episode.air_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(episode.air_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {episode.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {episode.runtime} minutos
                    </span>
                  )}
                  {episode.vote_average > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                      {episode.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>

                {episode.overview ? (
                  <p className="text-sm text-foreground/80 leading-relaxed">{episode.overview}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma descrição disponível para este episódio.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function EpisodeBrowser({ tvId, seasons }: Props) {
  const activeSeasons = seasons.filter((s) => s.season_number > 0);
  const [activeSeasonNumber, setActiveSeasonNumber] = useState(
    activeSeasons.length > 0 ? activeSeasons[activeSeasons.length - 1].season_number : 1,
  );
  const [selectedEpisode, setSelectedEpisode] = useState<TmdbEpisode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: seasonData, isLoading } = useTVSeason(tvId, activeSeasonNumber);

  const scroll = (dir: "l" | "r") => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "l" ? -w : w, behavior: "smooth" });
  };

  if (activeSeasons.length === 0) return null;

  return (
    <div className="mt-8 sm:mt-12">
      <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-5">Episódios</h3>

      <div className="flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto scrollbar-hidden pb-1">
        {activeSeasons.map((s) => (
          <SeasonTab
            key={s.season_number}
            season={s}
            isActive={s.season_number === activeSeasonNumber}
            onClick={() => setActiveSeasonNumber(s.season_number)}
          />
        ))}
      </div>

      <div className="relative group w-full max-w-full">
        <div
          ref={scrollRef}
          className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 sm:overflow-x-auto scrollbar-hidden scroll-smooth sm:snap-x snap-mandatory pb-3"
          style={{ scrollBehavior: "smooth" }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-full sm:w-56 lg:w-64 space-y-2">
                <div className="aspect-video rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-4 w-32 bg-muted/40 animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted/40 animate-pulse rounded" />
              </div>
            ))
          ) : seasonData?.episodes ? (
            seasonData.episodes.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} onClick={() => setSelectedEpisode(ep)} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-8">Nenhum episódio disponível.</p>
          )}
        </div>

        <button
          onClick={() => scroll("l")}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all duration-300 -ml-1 z-10 hidden sm:grid"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll("r")}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all duration-300 -mr-1 z-10 hidden sm:grid"
          aria-label="Próximo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <EpisodeSheet
        episode={selectedEpisode}
        open={!!selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
      />
    </div>
  );
}
