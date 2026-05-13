import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { MovieCard } from "./MovieCard";

interface Props {
  title: string;
  movies: Movie[];
  size?: "sm" | "md" | "lg";
}

export function MovieRow({ title, movies, size = "md" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "l" | "r") => {
    if (!ref.current) return;
    const w = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({ left: dir === "l" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="relative py-6 group/row">
      <div className="flex items-end justify-between mb-4 px-4 sm:px-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          {title}
        </motion.h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("l")}
            className="w-10 h-10 grid place-items-center rounded-full glass hover:bg-primary/20 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("r")}
            className="w-10 h-10 grid place-items-center rounded-full glass hover:bg-primary/20 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hidden scroll-smooth px-4 sm:px-8 pb-2"
      >
        {movies.map((m, i) => (
          <div 
            key={m.id} 
            className="shrink-0 w-[40%] sm:w-[calc(33.333%-10.66px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-13.33px)] xl:w-[calc(14.28%-13.7px)]"
          >
            <MovieCard movie={m} size="full" index={i} />
          </div>
        ))}
        <div className="shrink-0 w-4" />
      </div>
    </section>
  );
}
