# APIs

## TMDB API v3 (The Movie Database)

**Base URL**: `https://api.themoviedb.org/3`
**Autenticação**: Bearer Token (v4 API Read Access Token)
**Idioma padrão**: `pt-BR` (hardcoded)

### Endpoints

#### Filmes

| Endpoint                    | Método | Finalidade                  | Usado em         |
| --------------------------- | ------ | --------------------------- | ---------------- |
| `/trending/movie/{window}`  | GET    | Filmes em alta (dia/semana) | Home, busca      |
| `/movie/popular`            | GET    | Filmes populares            | Home, categorias |
| `/movie/now_playing`        | GET    | Filmes em cartaz            | Home             |
| `/movie/upcoming`           | GET    | Lançamentos                 | Home             |
| `/movie/top_rated`          | GET    | Filmes mais bem avaliados   | Home             |
| `/movie/{id}`               | GET    | Detalhes do filme           | Página do filme  |
| `/movie/{id}/videos`        | GET    | Trailers do filme           | Página do filme  |
| `/movie/{id}/credits`       | GET    | Elenco do filme             | Página do filme  |
| `/movie/{id}/release_dates` | GET    | Classificação indicativa    | Página do filme  |
| `/movie/{id}/similar`       | GET    | Filmes similares            | Página do filme  |
| `/search/movie`             | GET    | Busca de filmes             | SearchOverlay    |
| `/discover/movie`           | GET    | Filmes por gênero           | Categorias       |
| `/genre/movie/list`         | GET    | Lista de gêneros (filmes)   | Categorias       |
| `/collection/{id}`          | GET    | Coleção/saga                | Página do filme  |

#### Séries

| Endpoint                | Método | Finalidade                 | Usado em         |
| ----------------------- | ------ | -------------------------- | ---------------- |
| `/trending/tv/{window}` | GET    | Séries em alta             | Home             |
| `/tv/popular`           | GET    | Séries populares           | Home, categorias |
| `/tv/top_rated`         | GET    | Séries mais bem avaliadas  | Home             |
| `/tv/{id}`              | GET    | Detalhes da série          | Página da série  |
| `/tv/{id}/videos`       | GET    | Trailers da série          | Página da série  |
| `/tv/{id}/credits`      | GET    | Elenco da série            | Página da série  |
| `/tv/{id}/season/{n}`   | GET    | Episódios de temporada     | Página da série  |
| `/tv/{id}/similar`      | GET    | Séries similares           | Página da série  |
| `/discover/tv`          | GET    | Séries por gênero / animes | Categorias       |
| `/genre/tv/list`        | GET    | Lista de gêneros (séries)  | Categorias       |

### Estrutura de Arquivos

```
src/services/api/
  client.ts         → Fetch wrapper (headers, auth, error handling)
  tmdb.ts           → Endpoints de filmes
  tvdb.ts           → Endpoints de séries
  types.ts          → Tipos TMDB brutos + tipos normalizados (Movie, TVShow)
  mappers.ts        → TmdbMovie → Movie
  tvMappers.ts      → TmdbTVShow → TVShow
  images.ts         → Construtor de URLs de imagens
  certifications.ts → Busca de classificação indicativa
```

### Fluxo de Chamada

```
Componente → Hook (useTmdb) → React Query → tmdbFetch() → TMDB API
                                                           │
                                                     Mapper ← JSON
                                                           │
                                              Hook retorna dados tipados
                                                           │
                                              Componente renderiza
```

### Cache

Os dados TMDB são cacheados pelo React Query:

- **10 minutos** para listas e detalhes
- **60 minutos** para lista de gêneros
- **Sem refetch** ao focar janela
- **1 retry** em caso de falha

---

## OpenAI API

**Modelo**: `gpt-4o-mini`
**Autenticação**: API Key via variável de ambiente (`OPENAI_API_KEY`)

### Usos

| Funcionalidade    | Temperatura | Max Tokens | Finalidade                      |
| ----------------- | ----------- | ---------- | ------------------------------- |
| Chatbot           | 0.7         | 500        | Assistente contextual de filmes |
| Correção de busca | 0.2         | 100        | Correção semântica de consultas |

### Chatbot (`sendChatMessage`)

- Contexto dinâmico baseado na página atual
- Se o usuário está em `/movie/:id`, o bot sabe qual filme é
- Sistema de prompt com dois modos: geral e com filme selecionado
- Respostas curtas com emojis

### Correção de Busca (`analyzeSearchQuery`)

- Acionado quando a busca TMDB retorna 0 resultados
- Envia o termo original para o GPT analisar
- Retorna JSON com `{ correctedQuery, isCorrection }`
- Se corrigido, faz nova busca TMDB com o termo corrigido

### Server Functions

```typescript
// src/services/aiService.ts
sendChatMessage({ messages, context? })
analyzeSearchQuery({ query })
```

---

## TMDB Images

**Base URL**: `https://image.tmdb.org/t/p`

| Tamanho    | Uso                            |
| ---------- | ------------------------------ |
| `w500`     | Posteres (padrão)              |
| `original` | Backdrops (padrão)             |
| `w780`     | Stills de episódios            |
| `w185`     | Fotos de perfil (elenco)       |
| `w300`     | Posteres pequenos (temporadas) |

### Fallbacks

Arquivos locais em `src/assets/` são usados quando a imagem TMDB é nula:

- `poster-1.jpg` para posteres
- `hero-1.jpg` para backdrops
