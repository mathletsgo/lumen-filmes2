# Arquitetura

## Visão Geral da Arquitetura

O Lumen Filmes é uma aplicação web full-stack construída com **TanStack Start**, um framework SSR (Server-Side Rendering) baseado em React 19 e Vite. A arquitetura segue o padrão **file-based routing** e utiliza **Server Functions** para lógica de servidor.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ React 19 │  │  TanStack │  │   React Query v5    │  │
│  │  (UI)    │  │  Router   │  │  (cache + fetching)  │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│         │            │                  │               │
│         ▼            ▼                  ▼               │
│  ┌──────────────────────────────────────────────────┐  │
│  │            TanStack Start (SSR)                  │  │
│  └──────────────────────────────────────────────────┘  │
│         │                    │                          │
│         ▼                    ▼                          │
│  ┌──────────┐        ┌──────────────┐                  │
│  │  TMDB    │        │ Server Fn's  │                  │
│  │  API     │        │  (DB + IA)   │                  │
│  └──────────┘        └──────────────┘                  │
│                             │                          │
│                      ┌──────┴──────┐                   │
│                      ▼             ▼                   │
│                 ┌────────┐  ┌──────────┐               │
│                 │ SQLite │  │ OpenAI   │               │
│                 │  (DB)  │  │ GPT-4o   │               │
│                 └────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Fluxo do Sistema

### Navegação

```
Usuário → Home (/)
  ├── Hero Banner (carrossel automático, 8s)
  ├── MovieRow "Em alta agora"
  ├── MovieRow "Séries em alta"
  ├── MovieRow "Em cartaz"
  ├── MovieRow "Filmes populares"
  ├── MovieRow "Séries populares"
  ├── MovieRow "Lançamentos em breve"
  └── MovieRow "Mais bem avaliados"
       │
       ├── Click card → /movie/:id  ou  /tv/:id
       ├── Navbar → Categorias, Favoritos, Perfil
       ├── Busca → SearchOverlay → TMDB / OpenAI
       └── ChatBot → OpenAI
```

### Fluxo de Dados

```
Browser → React Query → tmdbFetch() → TMDB API
Browser → Server Function → dbService → SQLite
Browser → Server Function → aiService → OpenAI
```

### Armazenamento

| Dado          | Localização           | Tipo                    |
| ------------- | --------------------- | ----------------------- |
| Favoritos     | localStorage          | Persistente (navegador) |
| Avaliações    | SQLite                | Persistente (servidor)  |
| Visualizações | SQLite                | Persistente (servidor)  |
| Cache TMDB    | React Query (memória) | Sessão (10min stale)    |
| Cache Gêneros | React Query (memória) | Sessão (60min stale)    |

## Gerenciamento de Estado

O projeto **não** utiliza stores globais (Redux/Zustand). O estado é gerenciado por:

1. **React Query** — dados de servidor (TMDB, certificações)
   - Cache automático com `staleTime` configurado
   - Refetch controlado, sem refetch on window focus
   - `keepPreviousData` para transições suaves em filtros

2. **localStorage + eventos** — favoritos
   - Hook `useFavorites` encapsula leitura/escrita
   - Evento customizado `favorites-changed` para sincronização
   - Atualização reativa via `useState` + `useEffect`

3. **Server Functions** — operações de servidor
   - Chamadas via `useServerFn` do TanStack Start
   - Métodos POST para escrita (incrementView, addReview)
   - Método GET para leitura (getMovieStats)

4. **Estado local (useState)** — UI state
   - Tabs, modais, formulários, inputs

## Organização do Código

```
src/
  routes/         → Páginas (1 arquivo = 1 rota)
  components/     → Componentes React reutilizáveis
  hooks/          → Hooks customizados (React Query wrappers)
  services/api/   → Cliente e endpoints TMDB
  services/       → Server functions (DB + IA)
  db/             → Conexão e schema SQLite
  lib/            → Utilitários de propósito geral
```

### Princípios

- **Separação por preocupação**: API, DB, UI, utilidades em pastas distintas
- **Server Functions** para toda lógica que requer acesso a secrets ou banco
- **Mappers** para transformar dados da API em tipos normalizados da aplicação
- **Componentes puros** com props tipadas, sem lógica de negócio acoplada

## Padrões Usados

### Padrão de Componente

```tsx
// Componente puro, recebe props tipadas
interface Props {
  movie: MediaItem;
  size?: "sm" | "md" | "lg";
  index?: number;
}

export function MovieCard({ movie, size = "md", index = 0 }: Props) {
  // ... render
}
```

### Padrão de Hook

```tsx
// Hook encapsula React Query + chamada de API
export const useTrending = () =>
  useQuery({
    queryKey: ["tmdb", "trending"],
    queryFn: () => getTrending("week"),
    staleTime: 1000 * 60 * 10,
  });
```

### Padrão de Server Function

```tsx
export const incrementView = createServerFn({ method: "POST" })
  .inputValidator((data: { movieId: string }) => data)
  .handler(async ({ data }) => {
    // lógica de servidor aqui
  });
```

### Padrão de Mapper

```tsx
export function mapTmdbMovie(m: TmdbMovie, opts): Movie {
  return {
    type: "movie",
    id: String(m.id),
    title: m.title,
    // ... mapeamento
  };
}
```
