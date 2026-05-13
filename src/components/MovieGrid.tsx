import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { MovieCard } from "./MovieCard";

interface Props {
  title: string;
  movies: Movie[];
}

export function MovieGrid({ title, movies }: Props) {
  return (
    <section className="relative py-6">
      <div className="mb-6 px-4 sm:px-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          {title}
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 px-4 sm:px-8">
        {movies.map((m, i) => (
          <MovieCard key={m.id} movie={m as any} size="full" index={i} />
        ))}
      </div>
    </section>
  );
}
