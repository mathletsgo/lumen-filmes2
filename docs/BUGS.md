# Bugs e Problemas

## 🔴 Críticos

### 1. `_genreCache` compartilhado entre requests (data race) ✅ FIXED

**Arquivo**: `src/services/api/tmdb.ts`

**Problema**: Cache de gêneros em variável global causava data race em SSR — múltiplas requests concorrentes disparavam fetches duplicados.

**Solução**: Implementado cache com promise compartilhada (`_genreCachePromise`). Requests concorrentes agora aguardam a mesma promise em vez de disparar múltiplos fetches. Mesma correção aplicada em `tvdb.ts` para TV genres.

---

### 2. TMDB API Key pode vazar em logs de erro ✅ FIXED

**Arquivo**: `src/services/api/client.ts`

**Problema**: Empty catch block (`catch {}`) e possibilidade do token aparecer em logs de erro.

**Solução**:

- `catch {}` agora tem corpo com fallback (`catch { msg = ... }`)
- Headers reordenados: `...init.headers` vem antes de `Authorization`, garantindo que o token nunca seja sobrescrito por headers externos

---

### 3. Type cast inseguro em `toMediaItems` ✅ FIXED

**Arquivo**: `src/routes/index.tsx:29-31`

**Problema**: Cast `as unknown as MediaItem[]` ignorava verificação de tipos.

**Solução**: Substituído por `items as MediaItem[]` com parâmetro tipado `(Movie | TVShow)[]`, que é estruturalmente seguro pois ambos os tipos já possuem o discriminador `type` correto.

---

## 🟡 Médios

### 4. Race condition em favoritos (múltiplas abas)

**Arquivo**: `src/lib/favorites.ts:20-21`

```typescript
window.addEventListener("favorites-changed", handler);
```

O evento customizado `favorites-changed` só funciona na mesma aba. Se o usuário tiver duas abas abertas, as alterações não são sincronizadas.

**Solução**: Usar `BroadcastChannel` API para sincronização cross-tab:

```typescript
const channel = new BroadcastChannel("favorites");
channel.postMessage(ids);
channel.addEventListener("message", (e) => setIds(e.data));
```

---

### 5. SQLite incompatível com serverless

**Arquivo**: `src/db/index.ts`

`better-sqlite3` é uma biblioteca nativa que depende de bindings C++. Não funciona em Cloudflare Workers, Vercel Edge Functions ou qualquer ambiente serverless.

**Solução**: Substituir por:

- **[Turso](https://turso.tech/)** — SQLite via HTTP, compatível com serverless
- **[Neon](https://neon.tech/)** — PostgreSQL serverless (requer migração de ORM)

---

### 6. Dados de download são mock (fictícios)

**Arquivo**: `src/services/api/mappers.ts:4-48`

```typescript
const mockDownloads = (id: number): Movie["downloads"] => { ... };
```

Todos os dados de download (magnet links, torrents, seeders, leechers, qualidade, tamanho) são **completamente fictícios**. Os links não funcionam.

**Solução**: Remover a seção de downloads ou integrar com uma API real (ex: YTS, 1337x, ou Popcorn Time).

---

### 7. Perfil com dados mockados

**Arquivo**: `src/routes/profile.tsx`

- Nome, email e avatar são hardcoded ("Alex Lumen", "alex@lumen.app")
- Estatísticas "Assistidos: 127" é valor fixo
- "Continuar assistindo" é simulado com dados de trending
- Botão "Configurações" não faz nada

**Solução**: Implementar autenticação real e buscar dados do backend.

---

## 🟢 Baixos

### 8. `oklch()` — compatibilidade com navegadores antigos

**Arquivo**: `src/styles.css`

A função de cor `oklch()` é suportada por navegadores modernos (~90% de cobertura global), mas não funciona em:

- Internet Explorer
- Safari < 15.4
- Firefox < 113
- Chrome/Edge < 111

**Solução**: Adicionar fallbacks CSS ou usar PostCSS plugin (`postcss-oklch-function`).

---

### 9. Imagens fallback importadas estaticamente

**Arquivo**: `src/services/api/images.ts:3-4`

```typescript
import fallbackPoster from "@/assets/poster-1.jpg";
import fallbackBackdrop from "@/assets/hero-1.jpg";
```

Imagens importadas estaticamente são inlineadas no bundle (base64 ou como assets), aumentando o tamanho do bundle inicial.

**Solução**: Usar URLs públicas ou SVGs inline para fallbacks.

---

### 10. Idioma hardcoded

**Arquivo**: `src/services/api/client.ts:30`

```typescript
url.searchParams.set("language", "pt-BR");
```

O idioma das requisições TMDB é fixo em português brasileiro. Não há suporte para outros idiomas.

**Solução**: Tornar configurável via contexto, query string ou preferências do usuário.

---

### 11. Sem testes automatizados

O projeto não possui nenhum teste:

- ❌ Testes unitários (Vitest)
- ❌ Testes de componentes (Testing Library)
- ❌ Testes de server functions
- ❌ Testes E2E (Playwright)

**Solução**:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```
