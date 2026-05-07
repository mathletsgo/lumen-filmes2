import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Star, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearch, useTrending } from "@/hooks/useTmdb";
import { useServerFn } from "@tanstack/react-start";
import { analyzeSearchQuery } from "@/services/aiService";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [aiCorrection, setAiCorrection] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const analyzeFn = useServerFn(analyzeSearchQuery);

  useEffect(() => {
    if (!open) {
      setQ("");
      setAiCorrection(null);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q);
      setAiCorrection(null); // Reset AI correction when user types
    }, 500);
    return () => clearTimeout(t);
  }, [q]);

  const trending = useTrending();
  const search = useSearch(debounced);
  const aiSearch = useSearch(aiCorrection || "");

  const isSearching = debounced.trim().length > 1;
  const isAiActive = !!aiCorrection;
  
  // Se a IA corrigiu, usamos os resultados da IA, senão usamos a busca normal
  const activeSearch = isAiActive ? aiSearch : search;
  const results = isSearching ? activeSearch.data ?? [] : (trending.data ?? []).slice(0, 6);
  const isLoading = isSearching ? (search.isFetching || isAiLoading || aiSearch.isFetching) : trending.isLoading;

  // Disparar IA se a busca normal não achar nada
  useEffect(() => {
    if (isSearching && search.isSuccess && search.data && search.data.length === 0 && !isAiLoading && !aiCorrection) {
      setIsAiLoading(true);
      analyzeFn({ data: { query: debounced } }).then(res => {
        if (res.success && res.isCorrection && res.correctedQuery) {
          setAiCorrection(res.correctedQuery);
        }
        setIsAiLoading(false);
      });
    }
  }, [search.isSuccess, search.data, debounced, isSearching, aiCorrection, isAiLoading, analyzeFn]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/85 backdrop-blur-2xl overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto pt-20 sm:pt-32 px-4 pb-20">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl glass-strong shadow-card"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar filmes, gêneros..."
                className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
              />
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full hover:bg-foreground/10">
                <X className="w-4 h-4" />
              </button>
            </motion.div>

            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              {isSearching ? (
                isAiActive ? (
                  <span className="flex items-center gap-1.5 text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mostrando resultados para "{aiCorrection}"
                  </span>
                ) : (
                  `Resultados para "${debounced}"`
                )
              ) : (
                "Em alta agora"
              )}
            </p>
            
            {isAiActive && (
              <p className="mt-1 text-xs text-muted-foreground">
                Busca original: <span className="line-through opacity-70">"{debounced}"</span>
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {isLoading && results.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl bg-muted/40 animate-pulse" />
                  ))
                : results.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link to="/movie/$id" params={{ id: m.id }} onClick={onClose} className="group block">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-card relative">
                          <img
                            src={m.poster}
                            alt={m.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-sm truncate">{m.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="w-3 h-3 fill-accent text-accent" />
                            {m.rating.toFixed(1)} • {m.year || "—"}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              {isSearching && !isLoading && results.length === 0 && !isAiActive && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Search className="w-10 h-10 mb-3 opacity-20" />
                  <p>Nenhum resultado para "{debounced}"</p>
                  <p className="text-xs mt-1">A IA não encontrou correspondências semânticas.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
