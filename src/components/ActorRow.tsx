import { useRef } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import type { TmdbPerson } from "@/services/api/types";
import { ActorCard } from "./ActorCard";

interface Props {
  title: string;
  people: TmdbPerson[];
}

export function ActorRow({ title, people }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "l" | "r") => {
    if (!ref.current) return;
    const w = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({ left: dir === "l" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="relative py-8 group/row">
      <div className="flex items-center justify-between mb-6 px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center shadow-glow">
            <User className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("l")}
            className="w-10 h-10 grid place-items-center rounded-full glass hover:bg-primary/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("r")}
            className="w-10 h-10 grid place-items-center rounded-full glass hover:bg-primary/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hidden scroll-smooth px-4 sm:px-8 pb-4"
      >
        {people.map((p, i) => (
          <ActorCard key={p.id} person={p} index={i} />
        ))}
        <div className="shrink-0 w-4" />
      </div>
    </section>
  );
}
