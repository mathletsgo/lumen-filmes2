import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import { HeroSkeleton, MovieRowSkeleton } from "@/components/Skeletons";
import { useNowPlaying, usePopular, useTopRated, useTrending, useUpcoming } from "@/hooks/useTmdb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Catálogo Cinematográfico" },
      { name: "description", content: "Descubra filmes em alta, lançamentos e clássicos com curadoria cinematográfica." },
    ],
  }),
  component: Index,
});

function Index() {
  const trending = useTrending();
  const popular = usePopular();
  const nowPlaying = useNowPlaying();
  const upcoming = useUpcoming();
  const topRated = useTopRated();

  const featured = trending.data ?? [];

  return (
    <div className="pb-10">
      {trending.isLoading || featured.length === 0 ? <HeroSkeleton /> : <HeroBanner movies={featured} />}

      <div className="-mt-24 relative z-20 space-y-2">
        {trending.isLoading ? (
          <MovieRowSkeleton title="Em alta agora" />
        ) : (
          <MovieRow title="Em alta agora" movies={trending.data ?? []} />
        )}

        {nowPlaying.isLoading ? (
          <MovieRowSkeleton title="Em cartaz" />
        ) : (
          <MovieRow title="Em cartaz" movies={nowPlaying.data ?? []} />
        )}

        {popular.isLoading ? (
          <MovieRowSkeleton title="Filmes populares" />
        ) : (
          <MovieRow title="Filmes populares" movies={popular.data ?? []} />
        )}

        {upcoming.isLoading ? (
          <MovieRowSkeleton title="Lançamentos em breve" />
        ) : (
          <MovieRow title="Lançamentos em breve" movies={upcoming.data ?? []} />
        )}

        {topRated.isLoading ? (
          <MovieRowSkeleton title="Mais bem avaliados" />
        ) : (
          <MovieRow title="Mais bem avaliados" movies={topRated.data ?? []} />
        )}
      </div>
    </div>
  );
}
