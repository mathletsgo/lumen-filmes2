import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,

  vite: {
    server: {
      host: true,
      allowedHosts: true,
      watch: {
        ignored: ["**/sqlite.db*", "**/.git/**", "**/lumen-filmes2-backup.zip", "**/dist/**"],
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "lucide-react",
        "framer-motion",
        "@tanstack/react-query",
        "@tanstack/react-router",
        "clsx",
        "tailwind-merge",
      ],
    },
  },

  tanstackStart: {
    server: {
      preset: "vercel",
    },
  },
});