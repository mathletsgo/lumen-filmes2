import { useQuery } from "@tanstack/react-query";
import { getWatchProviders } from "@/services/api/tmdb";
import { ExternalLink, Film, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { WatchProviderItem } from "@/services/api/types";

interface Props {
  id: string;
  mediaType?: "movie" | "tv";
}

const STALE = 1000 * 60 * 60;
const IMG_BASE = "https://image.tmdb.org/t/p/original";

interface PlatformTheme {
  glow: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  iconColor: string;
  hoverGlow: string;
  accent: string;
}

const platformThemes: Record<string, PlatformTheme> = {
  Netflix: {
    glow: "rgba(229, 9, 20, 0.15)",
    border: "rgba(229, 9, 20, 0.3)",
    badgeBg: "rgba(229, 9, 20, 0.15)",
    badgeText: "#e50914",
    iconColor: "#e50914",
    hoverGlow: "rgba(229, 9, 20, 0.25)",
    accent: "from-red-500/20 to-transparent",
  },
  "Prime Video": {
    glow: "rgba(0, 168, 225, 0.15)",
    border: "rgba(0, 168, 225, 0.3)",
    badgeBg: "rgba(0, 168, 225, 0.15)",
    badgeText: "#00a8e1",
    iconColor: "#00a8e1",
    hoverGlow: "rgba(0, 168, 225, 0.25)",
    accent: "from-sky-500/20 to-transparent",
  },
  "Disney+": {
    glow: "rgba(81, 127, 255, 0.15)",
    border: "rgba(81, 127, 255, 0.3)",
    badgeBg: "rgba(81, 127, 255, 0.15)",
    badgeText: "#517fff",
    iconColor: "#517fff",
    hoverGlow: "rgba(81, 127, 255, 0.25)",
    accent: "from-indigo-500/20 to-transparent",
  },
  Max: {
    glow: "rgba(130, 87, 229, 0.15)",
    border: "rgba(130, 87, 229, 0.3)",
    badgeBg: "rgba(130, 87, 229, 0.15)",
    badgeText: "#8257e5",
    iconColor: "#8257e5",
    hoverGlow: "rgba(130, 87, 229, 0.25)",
    accent: "from-purple-500/20 to-transparent",
  },
  "Apple TV+": {
    glow: "rgba(200, 200, 210, 0.12)",
    border: "rgba(200, 200, 210, 0.2)",
    badgeBg: "rgba(200, 200, 210, 0.12)",
    badgeText: "#c8c8d2",
    iconColor: "#c8c8d2",
    hoverGlow: "rgba(200, 200, 210, 0.2)",
    accent: "from-gray-300/10 to-transparent",
  },
  Globoplay: {
    glow: "rgba(227, 81, 64, 0.15)",
    border: "rgba(227, 81, 64, 0.3)",
    badgeBg: "rgba(227, 81, 64, 0.15)",
    badgeText: "#e35140",
    iconColor: "#e35140",
    hoverGlow: "rgba(227, 81, 64, 0.25)",
    accent: "from-red-400/20 to-transparent",
  },
};

const defaultTheme: PlatformTheme = {
  glow: "rgba(168, 85, 247, 0.15)",
  border: "rgba(168, 85, 247, 0.3)",
  badgeBg: "rgba(168, 85, 247, 0.15)",
  badgeText: "#a855f7",
  iconColor: "#a855f7",
  hoverGlow: "rgba(168, 85, 247, 0.25)",
  accent: "from-primary/20 to-transparent",
};

function getTheme(name: string): PlatformTheme {
  return platformThemes[name] || defaultTheme;
}

export function WatchButton({ id, mediaType = "movie" }: Props) {
  const { data: providers, isLoading } = useQuery({
    queryKey: ["tmdb", "watch", mediaType, id],
    queryFn: () => getWatchProviders(id, mediaType),
    staleTime: STALE,
    enabled: !!id,
  });

  const streaming = providers?.flatrate || [];
  const cinema = providers?.cinema || [];
  const link = providers?.link || "";

  if (isLoading) {
    return (
      <div className="w-full sm:w-auto">
        <div className="h-12 w-56 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (streaming.length > 0) {
    const main = streaming[0];
    const theme = getTheme(main.provider_name);

    return (
      <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
        <motion.a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            boxShadow: `0 0 24px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
          className="
            relative overflow-hidden inline-flex items-center gap-3 px-6 h-12 rounded-xl
            bg-gradient-to-b from-white/8 to-white/4
            backdrop-blur-xl border border-white/10
            text-foreground font-semibold text-sm
            hover:shadow-xl active:shadow-md
            transition-all duration-400 cursor-pointer w-full sm:w-auto justify-center
            group
          "
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.boxShadow = `0 0 32px ${theme.hoverGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.boxShadow = `0 0 24px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
          }}
        >
          <Play className="w-5 h-5 fill-current relative z-10" style={{ color: theme.iconColor }} />
          <span className="relative z-10 font-bold">Assistir agora</span>
          <div
            className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-sm"
            style={{ background: theme.badgeBg, color: theme.badgeText }}
          >
            {main.logo_path && (
              <img
                src={`${IMG_BASE}${main.logo_path}`}
                alt={main.provider_name}
                className="w-3.5 h-3.5 rounded object-contain"
              />
            )}
            {main.provider_name}
          </div>
          <ExternalLink className="w-3.5 h-3.5 relative z-10 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </motion.a>
        {streaming.length > 1 && (
          <div className="flex items-center gap-1.5 pl-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Também em
            </span>
            <div className="flex items-center gap-1">
              {streaming.slice(1, 5).map((p) => (
                <div
                  key={p.provider_id}
                  className="w-5 h-5 rounded bg-muted/40 overflow-hidden ring-1 ring-border/30"
                  title={p.provider_name}
                >
                  {p.logo_path ? (
                    <img
                      src={`${IMG_BASE}${p.logo_path}`}
                      alt={p.provider_name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[5px] font-bold text-muted-foreground">
                      {p.provider_name.slice(0, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (cinema.length > 0) {
    return (
      <motion.a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden inline-flex items-center gap-3 px-6 h-12 rounded-xl bg-gradient-to-b from-white/8 to-white/4 backdrop-blur-xl border border-white/10 text-foreground font-semibold text-sm hover:shadow-xl transition-all cursor-pointer group"
        style={{ boxShadow: "0 0 24px rgba(245, 158, 11, 0.12)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        }}
      >
        <Film className="w-5 h-5 text-amber-400 relative z-10" />
        <div className="relative z-10 flex flex-col items-start">
          <span className="text-sm font-bold leading-tight">Comprar ingresso</span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            Em cartaz nos cinemas
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 relative z-10 text-muted-foreground/50" />
      </motion.a>
    );
  }

  return (
    <button
      disabled
      className="relative overflow-hidden inline-flex items-center gap-3 px-6 h-12 rounded-xl bg-gradient-to-b from-white/8 to-white/4 backdrop-blur-xl border border-white/5 text-foreground/60 font-semibold text-sm opacity-70 cursor-not-allowed w-full sm:w-auto justify-center"
      style={{ boxShadow: "0 0 24px rgba(168, 85, 247, 0.08)" }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      Em breve
    </button>
  );
}
