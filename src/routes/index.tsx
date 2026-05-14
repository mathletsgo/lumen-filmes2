import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieRow } from "@/components/MovieRow";
import { HeroSkeleton, MovieRowSkeleton } from "@/components/Skeletons";
import { ActorRow } from "@/components/ActorRow";
import {
  useNowPlaying,
  usePopular,
  useTopRated,
  useTrending,
  useUnreleased,
  useUpcoming,
  useTrendingTV,
  usePopularTV,
  useTopActors,
} from "@/hooks/useTmdb";
import type { MediaItem, Movie, TVShow } from "@/services/api/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen." },
      {
        name: "description",
        content: "Descubra filmes em alta, lançamentos e clássicos com curadoria cinematográfica.",
      },
    ],
  }),
  component: Index,
});

function toMediaItems(items: (Movie | TVShow)[]): MediaItem[] {
  return items as MediaItem[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Index() {
  const trending = useTrending();
  const popular = usePopular();
  const nowPlaying = useNowPlaying();
  const upcoming = useUpcoming();
  const unreleased = useUnreleased();
  const topRated = useTopRated();
  const topActors = useTopActors();
  const trendingTV = useTrendingTV();
  const popularTV = usePopularTV();

  const popularMovies = popular.data ?? [];
  const nowPlayingMovies = nowPlaying.data ?? [];
  const trendingMovies = trending.data ?? [];
  const popularTVItems = popularTV.data ?? [];
  const trendingTVItems = trendingTV.data ?? [];

  const featuredPool = [
    ...popularMovies,
    ...nowPlayingMovies,
    ...trendingMovies,
    ...popularTVItems,
    ...trendingTVItems,
  ];

  const ratedMovies = featuredPool.filter((item) => item.rating >= 6);

  const featured: MediaItem[] = toMediaItems(
    shuffleArray(ratedMovies.length >= 4 ? ratedMovies : featuredPool).slice(
      0,
      12
    )
  );

  return (
    <div className="pb-10">
      {popular.isLoading && nowPlaying.isLoading ? (
        <HeroSkeleton />
      ) : (
        <HeroBanner movies={featured} />
      )}

      <div className="-mt-24 relative z-20 space-y-2">
        {trending.isLoading ? (
          <MovieRowSkeleton title="Filmes em alta" />
        ) : (
          <MovieRow title="Filmes em alta" movies={toMediaItems(trending.data ?? [])} />
        )}

        {trendingTV.isLoading ? (
          <MovieRowSkeleton title="Séries em alta" />
        ) : (
          <MovieRow title="Séries em alta" movies={toMediaItems(trendingTV.data ?? [])} />
        )}

        {nowPlaying.isLoading ? (
          <MovieRowSkeleton title="Em cartaz" />
        ) : (
          <MovieRow title="Em cartaz" movies={toMediaItems(nowPlaying.data ?? [])} />
        )}




        {unreleased.isLoading ? (
          <MovieRowSkeleton title="Em breve nos cinemas" />
        ) : unreleased.data && unreleased.data.length > 0 ? (
          <MovieRow title="Em breve nos cinemas" movies={toMediaItems(unreleased.data)} />
        ) : null}

        {topRated.isLoading ? (
          <MovieRowSkeleton title="Mais bem avaliados" />
        ) : (
          <MovieRow title="Mais bem avaliados" movies={toMediaItems(topRated.data ?? [])} />
        )}

        {topActors.data && (
          <ActorRow 
            title="Melhores atores" 
            people={topActors.data} 
          />
        )}
      </div>
    </div>
  );
}
