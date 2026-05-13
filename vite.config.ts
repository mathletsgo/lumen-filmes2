import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,

  vite: {
    server: {
      host: true,
      allowedHosts: true,
    },
  },

  tanstackStart: {
    server: {
      preset: "vercel",
    },
  },
});