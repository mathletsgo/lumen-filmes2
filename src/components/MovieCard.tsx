import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, Star, Heart } from "lucide-react";
import type { Movie } from "@/data/movies";
import { useFavorites } from "@/lib/favorites";
import { AgeBadge } from "@/components/AgeBadge";
import { useCertification } from "@/hooks/useCertification";

interface Props {
  movie: Movie;
  size?: "sm" | "md" | "lg";
  index?: number;
}

export function MovieCard({ movie, size = "md", index = 0 }: Props) {
  const { has, toggle } = useFavorites();
  const { data: cert } = useCertification(movie.id);
  const fav = has(movie.id);

  const widths = {
    sm: "w-40 sm:w-44",
    md: "w-52 sm:w-56",
    lg: "w-64 sm:w-72",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className={`group relative shrink-0 ${widths[size]}`}
    >
      <Link
        to="/movie/$id"
        params={{ id: movie.id }}
        className="block relative aspect-[2/3] overflow-hidden rounded-2xl shadow-card"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          width={512}
          height={768}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-2 py-1 rounded-md glass-strong text-xs font-semibold">
            <Star className="w-3 h-3 fill-accent text-accent" />
            {movie.rating.toFixed(1)}
          </span>
          {cert && <AgeBadge code={cert} size="sm" />}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(movie.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
          aria-label="Favoritar"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${fav ? "fill-primary text-primary" : "text-foreground"}`}
          />
        </button>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-4 transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="font-semibold text-base leading-tight text-shadow-cinema line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{movie.year}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{movie.duration}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="truncate">{movie.genres[0]}</span>
          </div>

          {/* Hover-only Download button */}
          <div className="mt-3 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-12 overflow-hidden transition-all duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-primary text-primary-foreground text-xs font-semibold shadow-glow">
              <Download className="w-3 h-3" />
              Baixar
            </div>
          </div>
        </div>

        {/* Glow border on hover */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-primary/40 transition-all duration-500 pointer-events-none" />
      </Link>
    </motion.div>
  );
}
