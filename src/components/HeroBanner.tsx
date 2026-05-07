import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { Movie } from "@/data/movies";
import { AgeBadge } from "@/components/AgeBadge";
import { useCertification } from "@/hooks/useCertification";

interface Props {
  movies: Movie[];
  interval?: number;
}

export function HeroBanner({ movies, interval = 7000 }: Props) {
  const slides = movies.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [paused, next, interval, slides.length]);

  if (slides.length === 0) return null;
  const current = slides[index];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative h-[92vh] min-h-[560px] sm:min-h-[640px] w-full overflow-hidden"
    >
      {/* Backdrop crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 8, ease: "linear" } }}
          className="absolute inset-0"
        >
          <img
            src={current.backdrop}
            alt={current.title}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-28 sm:pb-32 px-4 sm:px-12 max-w-screen-2xl mx-auto">
        <AnimatePresence mode="wait">
          <SlideContent key={current.id} movie={current} />
        </AnimatePresence>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="hidden sm:grid absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 place-items-center rounded-full glass-strong hover:bg-primary/20 hover:scale-110 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        aria-label="Próximo"
        className="hidden sm:grid absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 place-items-center rounded-full glass-strong hover:bg-primary/20 hover:scale-110 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots + progress */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20 flex items-center justify-center gap-3 px-4">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Ir para slide ${i + 1}`}
            className="group relative h-1.5 rounded-full overflow-hidden bg-foreground/20 hover:bg-foreground/30 transition-all"
            style={{ width: i === index ? 56 : 24 }}
          >
            {i === index && !paused && (
              <motion.span
                key={`p-${i}-${index}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: interval / 1000, ease: "linear" }}
                className="absolute inset-y-0 left-0 gradient-primary"
              />
            )}
            {i === index && paused && (
              <span className="absolute inset-0 gradient-primary" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function SlideContent({ movie }: { movie: Movie }) {
  const { data: cert } = useCertification(movie.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium tracking-widest uppercase mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Em destaque
      </div>

      <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-shadow-cinema">
        {movie.title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 mt-6 text-sm">
        <span className="flex items-center gap-1 font-semibold">
          <Star className="w-4 h-4 fill-accent text-accent" />
          {movie.rating.toFixed(1)}
        </span>
        <span className="text-muted-foreground">{movie.year}</span>
        <span className="text-muted-foreground">{movie.duration}</span>
        {cert && <AgeBadge code={cert} size="sm" />}
        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g} className="px-2.5 py-0.5 rounded-full glass text-xs">
              {g}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 text-base sm:text-lg text-foreground/80 max-w-xl leading-relaxed line-clamp-3">
        {movie.synopsis}
      </p>

      <div className="flex flex-wrap gap-3 mt-8">
        <Link
          to="/movie/$id"
          params={{ id: movie.id }}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-105 transition-transform duration-300"
        >
          <Play className="w-5 h-5 fill-current" />
          Ver detalhes
        </Link>
        <Link
          to="/movie/$id"
          params={{ id: movie.id }}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-strong font-semibold hover:bg-foreground/10 transition-colors"
        >
          <Info className="w-5 h-5" />
          Mais informações
        </Link>
      </div>
    </motion.div>
  );
}
