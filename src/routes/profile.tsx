import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Settings, Crown, Clock, Heart } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useFavorites } from "@/lib/favorites";
import { MovieCard } from "@/components/MovieCard";
import { useTrending } from "@/hooks/useTmdb";
import { getMovieDetails } from "@/services/api/tmdb";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Lumen" },
      { name: "description", content: "Gerencie sua conta, plano e preferências no Lumen." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { ids } = useFavorites();
  const trending = useTrending();
  const continueWatching = (trending.data ?? []).slice(0, 4);

  const favQueries = useQueries({
    queries: ids.slice(0, 5).map((id) => ({
      queryKey: ["tmdb", "movie", id],
      queryFn: () => getMovieDetails(id),
      staleTime: 1000 * 60 * 10,
    })),
  });
  const favs = favQueries.map((q) => q.data).filter(Boolean) as NonNullable<(typeof favQueries)[number]["data"]>[];

  const stats = [
    { label: "Assistidos", value: "127", icon: Clock },
    { label: "Favoritos", value: ids.length.toString(), icon: Heart },
    { label: "Plano", value: "Premium", icon: Crown },
  ];

  return (
    <div className="pt-28 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{
          background: "radial-gradient(ellipse at top, oklch(0.7 0.27 340 / 0.3), transparent 60%)",
        }} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-28 h-28 rounded-3xl gradient-primary grid place-items-center text-4xl font-black shadow-glow">AL</div>
            <div className="flex-1">
              <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">Bem-vindo de volta</p>
              <h1 className="text-4xl sm:text-5xl font-black mt-1">Alex Lumen</h1>
              <p className="text-muted-foreground mt-1">alex@lumen.app · Membro desde 2024</p>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-foreground/10 transition-colors">
              <Settings className="w-4 h-4" /> Configurações
            </button>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="p-6 rounded-2xl glass-strong flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary grid place-items-center shadow-glow">
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-12 max-w-screen-2xl mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4">Continuar assistindo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {continueWatching.map((m, i) => (
            <div key={m.id} className="space-y-2">
              <MovieCard movie={m} index={i} />
              <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full gradient-primary" style={{ width: `${30 + i * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {favs.length > 0 && (
        <section className="px-4 sm:px-12 max-w-screen-2xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-4">Seus favoritos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {favs.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
