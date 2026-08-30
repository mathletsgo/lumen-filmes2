import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
import { 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Star, 
  Calendar, 
  Film, 
  Tv, 
  Sparkles, 
  Loader2,
  SlidersHorizontal,
  Zap
} from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { MovieGridSkeleton } from "@/components/Skeletons";
import { useGenres } from "@/hooks/useTmdb";
import { getByGenre, getPopular, ANIME_GENRE_ID, ADULT_GENRE_ID, type DiscoverOptions } from "@/services/api/tmdb";
import { getTVByGenre, getPopularTV, type TVDiscoverOptions } from "@/services/api/tvdb";
import type { MediaItem } from "@/services/api/types";

type SortOption = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
type MediaType = "all" | "movie" | "tv" | "anime";

type CategoriesSearch = {
  genre?: number | null;
  type?: MediaType;
  sort?: SortOption;
};

export const Route = createFileRoute("/categories")({
  validateSearch: (search: Record<string, unknown>): CategoriesSearch => {
    const rawType = search.type as MediaType;
    return {
      genre: search.genre ? Number(search.genre) : null,
      type: ["all", "movie", "tv", "anime"].includes(rawType) ? rawType : "all",
      sort: (search.sort as SortOption) || "popularity.desc",
    };
  },
  head: () => ({
    meta: [
      { title: "Categorias e Filtros — Lumen Filmes" },
      {
        name: "description",
        content:
          "Explore o melhor do cinema e das séries por gênero, popularidade, avaliação e relevância.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { genre: activeId = null, type: mediaType = "all", sort: sortBy = "popularity.desc" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.id });

  const [page, setPage] = useState<number>(1);
  const [showAllGenres, setShowAllGenres] = useState<boolean>(false);

  const genresQuery = useGenres();

  // Reset page pagination when filters change
  const handleSelectGenre = (genreId: number | null) => {
    setPage(1);
    navigate({ search: (old) => ({ ...old, genre: genreId }), replace: true });
  };

  const handleSelectType = (type: MediaType) => {
    setPage(1);
    navigate({ search: (old) => ({ ...old, type }), replace: true });
  };

  const handleSelectSort = (sort: SortOption) => {
    setPage(1);
    navigate({ search: (old) => ({ ...old, sort }), replace: true });
  };

  // Generate page numbers to fetch incrementally [1, 2, ..., page]
  const pageNumbers = useMemo(() => Array.from({ length: page }, (_, i) => i + 1), [page]);

  // Query Movies across pages
  const movieQueries = useQueries({
    queries: (mediaType === "tv" ? [] : pageNumbers).map((p) => ({
      queryKey: ["tmdb", "discover_movies", activeId, sortBy, mediaType, p],
      queryFn: () => {
        const isAnimeMode = mediaType === "anime";
        const targetGenre = activeId === null ? (isAnimeMode ? ANIME_GENRE_ID : null) : activeId;

        if (targetGenre === null) {
          return getPopular(p);
        }

        return getByGenre(targetGenre, {
          page: p,
          sortBy: sortBy as DiscoverOptions["sortBy"],
          minVotes: sortBy === "vote_average.desc" ? 100 : 30,
          withOriginalLanguage: isAnimeMode ? "ja" : undefined,
          withAnimation: isAnimeMode && activeId !== null && activeId !== ANIME_GENRE_ID,
        });
      },
      staleTime: 1000 * 60 * 10,
    })),
  });

  // Query TV Shows across pages
  const tvQueries = useQueries({
    queries: (mediaType === "movie" ? [] : pageNumbers).map((p) => ({
      queryKey: ["tmdb", "discover_tv", activeId, sortBy, mediaType, p],
      queryFn: () => {
        const isAnimeMode = mediaType === "anime";
        const targetGenre = activeId === null ? (isAnimeMode ? ANIME_GENRE_ID : null) : activeId;

        if (targetGenre === null) {
          return getPopularTV(p);
        }

        return getTVByGenre(targetGenre, {
          page: p,
          sortBy: sortBy as TVDiscoverOptions["sortBy"],
          minVotes: sortBy === "vote_average.desc" ? 80 : 20,
          withOriginalLanguage: isAnimeMode ? "ja" : undefined,
          withAnimation: isAnimeMode && activeId !== null && activeId !== ANIME_GENRE_ID,
        });
      },
      staleTime: 1000 * 60 * 10,
    })),
  });

  // Aggregate and deduplicate loaded items
  const { list, isLoadingInitial, isFetchingMore } = useMemo(() => {
    const items: MediaItem[] = [];
    const seen = new Set<string>();

    // Process movie results
    movieQueries.forEach((q) => {
      (q.data ?? []).forEach((m) => {
        const key = `movie-${m.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push(m);
        }
      });
    });

    // Process TV results
    tvQueries.forEach((q) => {
      (q.data ?? []).forEach((t) => {
        const key = `tv-${t.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push(t);
        }
      });
    });

    const isFirstPageLoading =
      (mediaType !== "tv" && movieQueries[0]?.isLoading) ||
      (mediaType !== "movie" && tvQueries[0]?.isLoading);

    const isAnyFetchingNext =
      (mediaType !== "tv" && movieQueries.some((q, idx) => idx > 0 && q.isFetching)) ||
      (mediaType !== "movie" && tvQueries.some((q, idx) => idx > 0 && q.isFetching));

    return {
      list: items,
      isLoadingInitial: isFirstPageLoading && items.length === 0,
      isFetchingMore: isAnyFetchingNext,
    };
  }, [movieQueries, tvQueries, mediaType]);

  const genresList = genresQuery.data ?? [];

  const visibleGenres = useMemo(() => {
    if (showAllGenres) return genresList;
    const adultGenre = genresList.find((g) => g.id === ADULT_GENRE_ID);
    const otherGenres = genresList.filter((g) => g.id !== ADULT_GENRE_ID);
    const topOthers = otherGenres.slice(0, 9);
    return adultGenre ? [...topOthers, adultGenre] : otherGenres.slice(0, 10);
  }, [genresList, showAllGenres]);

  return (
    <div className="pt-24 sm:pt-32 pb-24 sm:pb-20 px-4 sm:px-12 max-w-screen-2xl mx-auto overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-[0.3em] uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Explorar Catálogo</span>
        </div>
        <h1 className="text-3xl sm:text-6xl font-black mt-1 sm:mt-2 tracking-tight">Categorias</h1>
        <p className="text-muted-foreground mt-1.5 sm:mt-3 max-w-2xl text-sm sm:text-lg">
          Filtre por gêneros, tipo de conteúdo e nível de relevância com curadoria cinematográfica.
        </p>
      </motion.div>

      {/* Genre Selector Pills */}
      <div className="mt-4 sm:mt-8">
        <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center">
          <button
            onClick={() => handleSelectGenre(null)}
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeId === null
                ? "gradient-primary text-primary-foreground shadow-glow scale-105"
                : "glass hover:bg-foreground/10 text-foreground/80"
            }`}
          >
            Todos os Gêneros
          </button>
          {visibleGenres.map((g) => (
            <button
              key={g.id}
              onClick={() => handleSelectGenre(g.id)}
              className={`px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeId === g.id
                  ? "gradient-primary text-primary-foreground shadow-glow scale-105"
                  : g.id === ADULT_GENRE_ID
                  ? "glass hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold"
                  : "glass hover:bg-foreground/10 text-foreground/80"
              }`}
            >
              {g.name}
            </button>
          ))}

          {genresList.length > 10 && (
            <button
              onClick={() => setShowAllGenres(!showAllGenres)}
              className="w-full sm:w-auto mt-1 sm:mt-0 justify-center px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium glass hover:bg-foreground/15 text-primary flex items-center gap-1.5 transition-colors border border-primary/20"
            >
              <span>{showAllGenres ? "Ver menos" : `Ver mais (+${genresList.length - 10})`}</span>
              {showAllGenres ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Secondary Filter Bar */}
      <div className="mt-4 sm:mt-10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl glass-strong border border-white/10 flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center justify-between">
        {/* Media Type Filter */}
        <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5 bg-background/40 p-1 rounded-lg sm:rounded-xl border border-white/5">
          <button
            onClick={() => handleSelectType("all")}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mediaType === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todos</span>
          </button>
          <button
            onClick={() => handleSelectType("movie")}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mediaType === "movie"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Filmes</span>
          </button>
          <button
            onClick={() => handleSelectType("tv")}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mediaType === "tv"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Séries</span>
          </button>
          <button
            onClick={() => handleSelectType("anime")}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mediaType === "anime"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Animes</span>
          </button>
        </div>

        {/* Sort Order Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground font-medium sm:mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Ordenar por:</span>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 bg-background/40 p-1 rounded-lg sm:rounded-xl border border-white/5">
            <button
              onClick={() => handleSelectSort("popularity.desc")}
              className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center justify-center gap-0.5 sm:gap-1 ${
                sortBy === "popularity.desc"
                  ? "bg-white/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
              <span>Mais Populares</span>
            </button>
            <button
              onClick={() => handleSelectSort("vote_average.desc")}
              className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center justify-center gap-0.5 sm:gap-1 ${
                sortBy === "vote_average.desc"
                  ? "bg-white/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              <span>Melhores Notas</span>
            </button>
            <button
              onClick={() => handleSelectSort("primary_release_date.desc")}
              className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center justify-center gap-0.5 sm:gap-1 ${
                sortBy === "primary_release_date.desc"
                  ? "bg-white/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
              <span>Lançamentos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Badge */}
      {!isLoadingInitial && (
        <div className="mt-2.5 sm:mt-6 flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground px-1">
          <span>
            Exibindo <strong className="text-foreground font-semibold">{list.length}</strong> títulos relevantes
          </span>
        </div>
      )}

      {/* Movie/TV Grid */}
      <div className="mt-3 sm:mt-8">
        {isLoadingInitial ? (
          <MovieGridSkeleton count={15} />
        ) : list.length === 0 ? (
          <div className="py-20 text-center glass rounded-3xl my-6 border border-white/5">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">Nenhum título encontrado</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Tente alterar os filtros de ordenação ou escolher outro gênero.
            </p>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-5 sm:gap-6"
            >
              <AnimatePresence>
                {list.map((m, i) => (
                  <MovieCard key={`${m.type}-${m.id}`} movie={m} size="full" index={i % 20} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            <div className="mt-14 flex justify-center">
              <button
                disabled={isFetchingMore}
                onClick={() => setPage((prev) => prev + 1)}
                className="group relative px-8 py-3.5 rounded-full glass-strong hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 font-semibold text-sm flex items-center gap-2.5 shadow-glow hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Carregando mais títulos...</span>
                  </>
                ) : (
                  <>
                    <span>Ver mais opções</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
