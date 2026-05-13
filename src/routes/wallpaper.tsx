import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { usePopular, usePopularTV, useTVAnime } from "@/hooks/useTmdb";
import { Play, Pause, ChevronLeft, ChevronRight, Star, Calendar, Clock } from "lucide-react";
import { AgeBadge } from "@/components/AgeBadge";
import { useCertification } from "@/hooks/useCertification";

export const Route = createFileRoute("/wallpaper")({
  component: WallpaperPage,
});

function WallpaperPage() {
  const moviesQuery = usePopular();
  const seriesQuery = usePopularTV();
  const animeQuery = useTVAnime();

  const [shuffledMovies, setShuffledMovies] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const isLoading = moviesQuery.isLoading || seriesQuery.isLoading || animeQuery.isLoading;
  const interval = 10000; // 10 seconds

  // Combine and shuffle items once they are loaded
  useEffect(() => {
    const movies = moviesQuery.data ?? [];
    const series = seriesQuery.data ?? [];
    const anime = animeQuery.data ?? [];

    if (movies.length > 0 || series.length > 0 || anime.length > 0) {
      const combined = [...movies, ...series, ...anime];
      // Shuffle combined list
      const shuffled = combined.sort(() => Math.random() - 0.5);
      setShuffledMovies(shuffled);
    }
  }, [moviesQuery.data, seriesQuery.data, animeQuery.data]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % shuffledMovies.length);
    setProgress(0);
  }, [shuffledMovies.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + shuffledMovies.length) % shuffledMovies.length);
    setProgress(0);
  }, [shuffledMovies.length]);

  const handlePanEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    // Changed to vertical swipe (TikTok style)
    if (info.offset.y < -threshold) {
      nextSlide(); // Swipe Up
    } else if (info.offset.y > threshold) {
      prevSlide(); // Swipe Down
    }
  };

  // Progress and auto-rotation logic
  useEffect(() => {
    if (!isPlaying || shuffledMovies.length === 0) return;

    const tick = 100; // Update progress every 100ms
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (tick / interval) * 100;
      });
    }, tick);

    return () => clearInterval(timer);
  }, [isPlaying, shuffledMovies.length, nextSlide]);

  if (isLoading || shuffledMovies.length === 0) {
    return (
      <div className="h-screen w-full grid place-items-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Preparando vitrine...</p>
        </div>
      </div>
    );
  }

  const currentMovie = shuffledMovies[currentIndex];
  const nextMovie = shuffledMovies[(currentIndex + 1) % shuffledMovies.length];

  return (
    <motion.div 
      onPanEnd={handlePanEnd}
      className="fixed inset-0 z-0 bg-black overflow-hidden select-none touch-none"
    >
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={currentMovie.backdrop}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Overlay for contrast - REMOVED blur as it was making it look embaçada */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Preload next image */}
      <link rel="preload" as="image" href={nextMovie.backdrop} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-16 lg:p-24 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl pointer-events-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-[10px] font-bold tracking-widest uppercase text-primary">
                Modo Vitrine
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-strong text-sm font-semibold">
                <Star className="w-4 h-4 fill-accent text-accent" />
                {currentMovie.rating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-strong text-sm font-semibold text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {currentMovie.year}
              </div>
            </div>

            {/* Reduced title size from 9xl to 7xl */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8 text-shadow-cinema">
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {currentMovie.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="px-4 py-1.5 rounded-full glass text-sm font-medium border border-white/5"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed line-clamp-3 mb-8 max-w-2xl text-shadow-sm">
              {currentMovie.synopsis}
            </p>

            <Link
              to="/movie/$id"
              params={{ id: currentMovie.id }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/20 hover:scale-105 transition-all text-white font-bold group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                <Play className="w-5 h-5 fill-current text-primary group-hover:text-primary-foreground" />
              </div>
              Assistir agora
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>


      {/* Slide indicators (dots) */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-3">
        {shuffledMovies.slice(0, 10).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setProgress(0);
            }}
            className={`w-1.5 rounded-full transition-all duration-500 ${
              i === currentIndex ? "h-8 bg-primary shadow-glow" : "h-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
