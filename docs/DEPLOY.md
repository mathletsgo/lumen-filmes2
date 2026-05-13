# Deploy

O Lumen Filmes pode ser deployado em dois provedores:

## Cloudflare Workers (preferencial)

### Configuração

**Arquivo**: `wrangler.jsonc`

```json
{
  "name": "lumen-filmes",
  "compatibility_date": "2024-01-01",
  "main": "./dist/server/index.js",
  "assets": { "directory": "./dist/client" },
  "vars": {
    "TMDB_API_KEY": "",
    "OPENAI_API_KEY": ""
  }
}
```

### Variáveis de Ambiente

```bash
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put OPENAI_API_KEY
```

### Deploy

```bash
npm run build
npx wrangler deploy
```

## Vercel (fallback)

### Configuração

**Arquivo**: `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Variáveis de Ambiente

Adicionar no dashboard da Vercel:

- `TMDB_API_KEY` — Server-side only
- `OPENAI_API_KEY` — Server-side only

### Deploy

```bash
npm run build
npx vercel deploy --prod
```

## Build

```bash
npm run build
```

Gera duas saídas:

- `dist/client/` — Assets estáticos (JS, CSS, imagens) para CDN
- `dist/server/` — Server bundle para Cloudflare Workers

## Estrutura de Saída

```
dist/
  client/
    assets/          → JS/CSS compilados
    index.html       → HTML de entrada
    favicon.ico      → Favicon
    ...
  server/
    index.js         → Server bundle (Cloudflare Workers)
    ...
```

## Ambientes

| Ambiente          | Comando                    | URL                                           |
| ----------------- | -------------------------- | --------------------------------------------- |
| Desenvolvimento   | `npm run dev`              | `http://localhost:3000`                       |
| Preview           | `npm run preview`          | `http://localhost:4173`                       |
| Produção (CF)     | `npx wrangler deploy`      | `https://lumen-filmes.seudominio.workers.dev` |
| Produção (Vercel) | `npx vercel deploy --prod` | `https://lumen-filmes.vercel.app`             |
