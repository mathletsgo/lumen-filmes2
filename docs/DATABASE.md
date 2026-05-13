# Banco de Dados

## Tecnologia

- **SQLite** via `better-sqlite3` (síncrono, zero configuração)
- **Drizzle ORM** — type-safe, esquema declarativo, migrations automatizadas
- **Arquivo**: `sqlite.db` (local, ignorado no git via `.gitignore`)

> ⚠️ **Limitação**: `better-sqlite3` não funciona em ambientes serverless (Cloudflare Workers, Vercel Edge). Para produção, migrar para [Turso](https://turso.tech/) (SQLite via HTTP) ou [Neon](https://neon.tech/) (PostgreSQL).

## Schema

**Arquivo**: `src/db/schema.ts`

### movie_views

Contagem de visualizações por filme.

| Coluna   | Tipo      | Constraints         | Descrição                 |
| -------- | --------- | ------------------- | ------------------------- |
| id       | `INTEGER` | PK, auto increment  | Identificador único       |
| movie_id | `TEXT`    | NOT NULL, UNIQUE    | ID do TMDB                |
| views    | `INTEGER` | NOT NULL, DEFAULT 1 | Contagem de visualizações |

### movie_reviews

Avaliações da comunidade.

| Coluna     | Tipo      | Constraints               | Descrição           |
| ---------- | --------- | ------------------------- | ------------------- |
| id         | `INTEGER` | PK, auto increment        | Identificador único |
| movie_id   | `TEXT`    | NOT NULL                  | ID do TMDB          |
| rating     | `INTEGER` | NOT NULL                  | Nota de 1 a 5       |
| comment    | `TEXT`    | —                         | Comentário opcional |
| created_at | `TEXT`    | DEFAULT CURRENT_TIMESTAMP | Data da avaliação   |

## Conexão

**Arquivo**: `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(path.resolve(process.cwd(), "sqlite.db"));
export const db = drizzle(sqlite, { schema });
```

O banco é criado automaticamente no `CWD` do projeto ao iniciar a aplicação.

## Server Functions

**Arquivo**: `src/services/dbService.ts`

### incrementView

```typescript
incrementView({ movieId: string })
  → { success: boolean, views: number }
```

- **Método**: POST
- **Função**: Incrementa contagem de visualizações
- **Lógica**: Se existe registro, incrementa. Se não, cria com 1.
- **Usado em**: Página de detalhes do filme (`useEffect` no mount)

### getMovieStats

```typescript
getMovieStats({ movieId: string })
  → { success: boolean, views: number, reviews: Review[], avgRating: number }
```

- **Método**: GET
- **Função**: Retorna estatísticas completas de um filme
- **Usado em**: `ReviewsSection` (não implementado diretamente — a seção busca avaliações separadamente)

### addReview

```typescript
addReview({ movieId: string, rating: number, comment?: string })
  → { success: boolean }
```

- **Método**: POST
- **Função**: Adiciona nova avaliação
- **Validação**: rating é obrigatório, comment é opcional
- **Usado em**: `ReviewsSection` (formulário)

## Migrations

**Arquivo**: `drizzle.config.ts`

```typescript
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: "sqlite.db" },
});
```

### Comandos

```bash
# Gerar migration a partir do schema
npx drizzle-kit generate

# Aplicar migration (desenvolvimento)
npx drizzle-kit push

# Abrir Drizzle Studio (UI para visualizar dados)
npx drizzle-kit studio
```

## Melhorias

- [ ] Adicionar índice em `movie_reviews.movie_id` para consultas mais rápidas
- [ ] Adicionar coluna `user_id` nas avaliações (quando autenticação for implementada)
- [ ] Migrar para Turso (SQLite serverless) para compatibilidade com Cloudflare Workers
- [ ] Adicionar soft delete nas avaliações
- [ ] Implementar paginação nas consultas de avaliações
