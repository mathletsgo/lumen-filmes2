import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useFavorites } from "@/lib/favorites";
import { MovieCard } from "@/components/MovieCard";
import { MovieGridSkeleton } from "@/components/Skeletons";
import { getMovieDetails } from "@/services/api/tmdb";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favoritos — Lumen" },
      { name: "description", content: "Sua lista pessoal de filmes favoritos no Lumen." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { ids } = useFavorites();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["tmdb", "movie", id],
      queryFn: () => getMovieDetails(id),
      staleTime: 1000 * 60 * 10,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const list = queries.map((q) => q.data).filter(Boolean) as NonNullable<
    (typeof queries)[number]["data"]
  >[];

  return (
    <div className="pt-32 pb-16 px-4 sm:px-12 max-w-screen-2xl mx-auto">
      <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">Sua coleção</p>
      <h1 className="text-5xl sm:text-6xl font-black mt-2">Favoritos</h1>
      <p className="text-muted-foreground mt-3">
        {ids.length} {ids.length === 1 ? "título salvo" : "títulos salvos"}.
      </p>

      {ids.length === 0 ? (
        <div className="mt-20 text-center">
          <div className="inline-grid place-items-center w-20 h-20 rounded-full glass-strong mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Sua lista está vazia</h2>
          <p className="text-muted-foreground mt-2">Comece a favoritar filmes para vê-los aqui.</p>
          <Link
            to="/"
            className="inline-block mt-6 px-7 py-3 rounded-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-105 transition-transform"
          >
            Explorar filmes
          </Link>
        </div>
      ) : isLoading ? (
        <div className="mt-10">
          <MovieGridSkeleton count={ids.length} />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {list.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
