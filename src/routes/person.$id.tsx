import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, VenetianMask, Languages, Film, Tv } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails, getPersonCredits } from "@/services/api/person";

export const Route = createFileRoute("/person/$id")({
  head: () => ({
    meta: [
      { title: "Artista — Lumen" },
      { name: "description", content: "Detalhes do artista no Lumen." },
    ],
  }),
  component: PersonPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center px-4">
      <div>
        <h2 className="text-3xl font-bold">Artista não encontrado</h2>
        <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-full gradient-primary">
          Voltar
        </Link>
      </div>
    </div>
  ),
});

function PersonPage() {
  const { id } = Route.useParams();

  const { data: person, isLoading } = useQuery({
    queryKey: ["tmdb", "person", id],
    queryFn: () => getPersonDetails(id),
    staleTime: 1000 * 60 * 60,
    enabled: !!id,
  });

  const { data: credits } = useQuery({
    queryKey: ["tmdb", "person", id, "credits"],
    queryFn: () => getPersonCredits(id),
    staleTime: 1000 * 60 * 10,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="pt-32 px-4 sm:px-12 max-w-screen-xl mx-auto space-y-6">
        <div className="flex gap-8">
          <div className="w-64 aspect-[2/3] rounded-2xl bg-muted/40 animate-pulse shrink-0 hidden lg:block" />
          <div className="flex-1 space-y-4">
            <div className="h-12 w-1/2 bg-muted/40 animate-pulse rounded" />
            <div className="h-6 w-1/3 bg-muted/40 animate-pulse rounded" />
            <div className="h-32 w-full bg-muted/40 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen grid place-items-center text-center px-4">
        <div>
          <h2 className="text-3xl font-bold">Artista não encontrado</h2>
          <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-full gradient-primary">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const filmesCount = credits?.cast.filter((c) => c.mediaType === "movie").length ?? 0;
  const seriesCount = credits?.cast.filter((c) => c.mediaType === "tv").length ?? 0;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-foreground/10 transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-elevated">
              <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-4 mb-2">
              <div className="lg:hidden w-24 h-24 rounded-2xl overflow-hidden shadow-elevated shrink-0">
                <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{person.name}</h1>
                <p className="text-lg text-muted-foreground mt-1">{person.knownFor}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {person.birthday && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  {new Date(person.birthday).toLocaleDateString("pt-BR")}
                  {person.deathday && ` — ${new Date(person.deathday).toLocaleDateString("pt-BR")}`}
                </span>
              )}
              {person.birthplace && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  {person.birthplace}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-sm">
                <Film className="w-4 h-4 text-primary" />
                {filmesCount} {filmesCount === 1 ? "filme" : "filmes"}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-sm">
                <Tv className="w-4 h-4 text-primary" />
                {seriesCount} {seriesCount === 1 ? "série" : "séries"}
              </span>
            </div>

            {person.alsoKnownAs.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Languages className="w-4 h-4" />
                <span>Também conhecido como: {person.alsoKnownAs.join(", ")}</span>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <VenetianMask className="w-5 h-5 text-primary" /> Biografia
              </h2>
              <p className="text-base text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {person.bio}
              </p>
            </div>
          </motion.div>
        </div>

        {credits && credits.cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Filmografia</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {credits.cast.map((c, i) => (
                <motion.div
                  key={`${c.mediaType}-${c.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <Link
                    to={c.mediaType === "movie" ? "/movie/$id" : "/tv/$id"}
                    params={{ id: String(c.id) }}
                    className="group block"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-card relative">
                      <img
                        src={c.poster}
                        alt={c.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {c.mediaType === "tv" && (
                        <div
                          className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                          style={{ background: "oklch(0.7 0.27 340 / 85%)", color: "white" }}
                        >
                          Série
                        </div>
                      )}
                    </div>
                    <p className="mt-2 font-medium text-sm truncate">{c.title}</p>
                    {c.character && (
                      <p className="text-xs text-muted-foreground truncate">{c.character}</p>
                    )}
                    {c.year > 0 && <p className="text-xs text-muted-foreground">{c.year}</p>}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
