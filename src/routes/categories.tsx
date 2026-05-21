import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MovieCard } from "@/components/MovieCard";
import { MovieGridSkeleton } from "@/components/Skeletons";
import { useByGenre, useGenres, usePopular } from "@/hooks/useTmdb";

type CategoriesSearch = {
  genre?: number | null;
};

export const Route = createFileRoute("/categories")({
  validateSearch: (search: Record<string, unknown>): CategoriesSearch => {
    return {
      genre: search.genre ? Number(search.genre) : null,
    };
  },
  head: () => ({
    meta: [
      { title: "Categorias — Lumen" },
      {
        name: "description",
        content:
          "Explore filmes por gênero: ação, ficção científica, romance, terror e muito mais.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { genre: activeId = null } = Route.useSearch();
  const navigate = useNavigate({ from: Route.id });
  
  const genres = useGenres();
  const byGenre = useByGenre(activeId);
  const popular = usePopular();

  const list = activeId === null ? (popular.data ?? []) : (byGenre.data ?? []);
  const isLoading = activeId === null ? popular.isLoading : byGenre.isLoading;

  return (
    <div className="pt-32 pb-16 px-4 sm:px-12 max-w-screen-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">Explorar</p>
        <h1 className="text-5xl sm:text-6xl font-black mt-2">Categorias</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Descubra histórias que combinam com o seu humor.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mt-8">
        <button
          onClick={() => navigate({ search: { genre: null }, replace: true })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeId === null
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "glass hover:bg-foreground/10"
          }`}
        >
          Todos
        </button>
        {genres.data?.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate({ search: { genre: g.id }, replace: true })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeId === g.id
                ? "gradient-primary text-primary-foreground shadow-glow"
                : "glass hover:bg-foreground/10"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {isLoading ? (
          <MovieGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {list.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
