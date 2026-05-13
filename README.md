# LUMEN FILMES

**Catálogo cinematográfico com curadoria digital — descubra filmes, séries e animes com uma experiência cinematográfica imersiva.**

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-7c3aed)
![Stack](https://img.shields.io/badge/stack-TanStack%20Start%20%7C%20React%2019%20%7C%20Tailwind%20v4-06b6d4)
![API](https://img.shields.io/badge/API-TMDB%20%7C%20OpenAI-ff6b35)

---

## Stack

| Camada          | Tecnologia                             |
| --------------- | -------------------------------------- |
| Framework       | TanStack Start (React 19 + SSR)        |
| Roteamento      | TanStack Router (file-based)           |
| Estado servidor | TanStack React Query v5                |
| Estilo          | Tailwind CSS v4 + shadcn/ui (New York) |
| Animações       | Framer Motion                          |
| Dados           | TMDB API v3 (Bearer token)             |
| IA              | OpenAI GPT-4o-mini                     |
| Banco           | SQLite + Drizzle ORM + better-sqlite3  |
| Deploy          | Cloudflare Workers + Vercel            |

## Pré-requisitos

- Node.js 20+ ou Bun
- Chave de API do TMDB ([obter](https://www.themoviedb.org/settings/api))
- Chave de API da OpenAI ([obter](https://platform.openai.com/api-keys))

## Ambiente local

```bash
npm install
cp .env.example .env
# Edite .env e preencha TMDB_API_KEY e OPENAI_API_KEY
npm run dev
```

## Comandos

| Comando             | Descrição                        |
| ------------------- | -------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento Vite |
| `npm run build`     | Build de produção (client + SSR) |
| `npm run build:dev` | Build modo desenvolvimento       |
| `npm run preview`   | Preview do build                 |
| `npm run lint`      | ESLint em todo o projeto         |
| `npm run format`    | Prettier em todo o projeto       |

## Estrutura

```
src/
  routes/         # Páginas (file-based routing)
  components/     # Componentes React + shadcn/ui
  hooks/          # React Query hooks personalizados
  services/api/   # Integração TMDB (client, endpoints, mappers, tipos)
  services/       # Server functions (DB + IA)
  db/             # Schema e conexão SQLite
  lib/            # Utilitários (favorites, cn)
```

## Documentação Detalhada

| Documento                                    | Descrição                                                        |
| -------------------------------------------- | ---------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura, fluxo do sistema, padrões, gerenciamento de estado  |
| [docs/API.md](docs/API.md)                   | APIs TMDB e OpenAI — endpoints, finalidade, onde são usadas      |
| [docs/COMPONENTS.md](docs/COMPONENTS.md)     | Componentes principais — responsabilidades e funcionamento       |
| [docs/DATABASE.md](docs/DATABASE.md)         | Schema SQLite, server functions, migrações                       |
| [docs/DEPLOY.md](docs/DEPLOY.md)             | Deploy em Cloudflare Workers e Vercel                            |
| [docs/ROADMAP.md](docs/ROADMAP.md)           | Roadmap futuro, checklist de melhorias, sugestões de monetização |
| [docs/BUGS.md](docs/BUGS.md)                 | Bugs e problemas encontrados com soluções sugeridas              |

## Deploy

O build gera duas saídas:

- `dist/client/` — assets estáticos para CDN
- `dist/server/` — server bundle para Cloudflare Workers

Configurado para deploy via `wrangler.jsonc` (Cloudflare) e `vercel.json` (fallback).

---

> Projeto construído com [TanStack Start](https://start.tanstack.com/), [shadcn/ui](https://ui.shadcn.com/) e [TMDB](https://www.themoviedb.org/).
