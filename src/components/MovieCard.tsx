import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, Star, Heart, Calendar } from "lucide-react";
import type { MediaItem } from "@/services/api/types";
import { useFavorites } from "@/lib/favorites";
import { useCertification } from "@/hooks/useCertification";
import { AgeBadge } from "./AgeBadge";

interface Props {
  movie: MediaItem;
  size?: "sm" | "md" | "lg" | "full";
  index?: number;
}

export function MovieCard({ movie, size = "md", index = 0 }: Props) {
  const { has, toggle } = useFavorites();
  const isTV = movie.type === "tv";
  const { data: cert } = useCertification(movie.id, movie.type as "movie" | "tv");

  const widths = {
    sm: "w-40 sm:w-44",
    md: "w-52 sm:w-56",
    lg: "w-64 sm:w-72",
    full: "w-full",
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
        to={isTV ? "/tv/$id" : "/movie/$id"}
        params={{ id: movie.id }}
        className="block relative aspect-[2/3] overflow-hidden rounded-2xl shadow-card"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          width={512}
          height={768}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            {movie.rating.toFixed(1)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(movie.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full glass-strong opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Favoritar"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${has(movie.id) ? "fill-primary text-primary" : "text-foreground"}`}
          />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-semibold text-sm leading-tight text-shadow-cinema line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            {!isTV && movie.releaseDate && movie.year > new Date().getFullYear() ? (
              <span className="flex items-center gap-1 text-primary">
                <Calendar className="w-3 h-3" />
                {new Date(movie.releaseDate).toLocaleDateString("pt-BR")}
              </span>
            ) : (
              <span>{movie.year}</span>
            )}
            {cert && <AgeBadge code={cert} size="xs" />}
            {!isTV && (movie as any).duration && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                <span>{(movie as any).duration}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
