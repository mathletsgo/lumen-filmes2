import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { posterUrl } from "@/services/api/images";
import type { TmdbPerson } from "@/services/api/types";

interface Props {
  person: TmdbPerson;
  index?: number;
}

export function ActorCard({ person, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative shrink-0 w-40 sm:w-48"
    >
      <Link
        to="/person/$id"
        params={{ id: String(person.id) }}
        className="block relative aspect-[2/3] overflow-hidden rounded-2xl shadow-card"
      >
        {person.profile_path ? (
          <img
            src={posterUrl(person.profile_path)}
            alt={person.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <User className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-bold text-sm text-white line-clamp-1">{person.name}</h3>
          <p className="text-[10px] text-primary font-medium uppercase tracking-wider mt-0.5">
            {person.known_for_department}
          </p>
        </div>
      </Link>
      
      <div className="mt-3 px-1 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="font-semibold text-sm line-clamp-1">{person.name}</h3>
        <p className="text-xs text-muted-foreground">{person.known_for_department}</p>
      </div>
    </motion.div>
  );
}
