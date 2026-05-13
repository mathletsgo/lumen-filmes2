# Componentes

## LoadingScreen

**Arquivo**: `src/components/LoadingScreen.tsx`

Tela de splash exibida por ~1.1s ao carregar a aplicação. Mostra o logo Lumen com ícone de filme e efeito de glow pulsante, com fade-out no final.

Também exporta `Skeleton` — componente base de placeholder para loading states.

---

## Navbar

**Arquivo**: `src/components/Navbar.tsx`

Barra de navegação fixa no topo com:

- **Logo** Lumen com ícone e gradiente
- **Links**: Início, Categorias, Favoritos, Perfil
- **Indicador ativo** com animação spring via `layoutId`
- **Efeito glass** ao scrollar (via `useRouterState`)
- **Ícones**: busca, favoritos, perfil
- **Mobile**: botão hamburger com drawer lateral animado (Framer Motion)
- Fecha drawer automaticamente ao navegar

### Estados

- `scrolled`: fundo glass ao scrollar > 20px
- `open`: drawer mobile aberto/fechado
- `searchOpen`: overlay de busca

---

## HeroBanner

**Arquivo**: `src/components/HeroBanner.tsx`

Carrossel cinematográfico principal com:

- **8 slides** com auto-play (8s de intervalo)
- **Pré-carregamento** de imagens adjacentes
- **Navegação**: setas laterais, indicadores de progresso animados, swipe touch
- **Overlays** gradientes para legibilidade
- **Animações**: fade + scale no backdrop, fade + slide no conteúdo
- **Pausa** no hover/touch

### SlideContent

- Badge "Em destaque" / "Série em destaque"
- Título, nota, ano, duração, classificação, gêneros
- Sinopse (3 linhas)
- Botões "Ver detalhes" e "Mais informações"
- Botão de mute (placeholder)

---

## MovieCard

**Arquivo**: `src/components/MovieCard.tsx`

Card de filme/série usado em grids e rows:

- Poster com lazy loading
- Nota TMDB + classificação indicativa
- Ano, duração, gênero
- Botão de favoritar (coração) no hover
- Badge "Série" para conteúdo TV
- Link para página de detalhes (`/movie/:id` ou `/tv/:id`)
- Animação de entrada com delay escalonado (índice)
- Overlay gradiente + botão "Baixar" no hover

### Props

```tsx
interface Props {
  movie: MediaItem;
  size?: "sm" | "md" | "lg"; // larguras: 44/56/72 (rem)
  index?: number; // delay de animação
}
```

### Estados

- `fav`: coração preenchido se favoritado
- `isTV`: ajusta rota e mostra badge

---

## MovieRow

**Arquivo**: `src/components/MovieRow.tsx`

Linha horizontal scrollável de filmes:

- Container com `overflow-x-auto` e `scrollbar-hidden`
- Botões de navegação (anterior/próximo) em desktop
- Scroll suave com `scrollBy`
- 3 tamanhos de card

### Props

```tsx
interface Props {
  title: string;
  movies: MediaItem[];
  size?: "sm" | "md" | "lg";
}
```

---

## SearchOverlay

**Arquivo**: `src/components/SearchOverlay.tsx`

Overlay fullscreen de busca:

- Input com auto-focus e debounce (500ms)
- Busca TMDB normal
- **Fallback IA**: se 0 resultados, aciona `analyzeSearchQuery` da OpenAI
- Exibe correção com sparkles quando a IA corrige
- Grid de resultados (6 itens) com poster + título + nota
- Loading skeleton durante busca
- Fecha com ESC ou botão X

### Estados

- `isSearching`: busca ativa (> 1 caractere)
- `isAiActive`: IA corrigiu a busca
- `isLoading`: fetching em andamento
- `results vazio`: mensagem "Nenhum resultado"

---

## ChatBot

**Arquivo**: `src/components/chat/ChatBot.tsx`

Assistente IA flutuante:

- Botão circular no canto inferior direito
- Janela de chat com 500px de altura
- **Contexto automático**: detecta se está em página de filme via router
- Histórico de mensagens com scroll automático
- 3 sugestões rápidas iniciais
- Input com Enter para enviar
- Indicador "Digitando..." durante loading

---

## ReviewsSection

**Arquivo**: `src/components/ReviewsSection.tsx`

Seção de avaliações da comunidade:

- Formulário: estrelas (1-5) + comentário opcional
- Validação: nota obrigatória
- Toast de sucesso/erro (Sonner)
- Refetch automático após envio
- Lista de avaliações com avatar anônimo, data, nota
- Card lateral com média e contagem

### Estados

- `loading`: skeleton enquanto carrega
- `empty`: mensagem "Nenhuma avaliação ainda"
- `submitting`: botão desabilitado durante envio

---

## AgeBadge

**Arquivo**: `src/components/AgeBadge.tsx`

Selo de classificação indicativa:

- Cores: L (verde), 10 (azul), 12 (âmbar), 14 (laranja), 16 (rosa), 18 (preto)
- 3 tamanhos: sm, md, lg
- Tooltip com descrição
- Acessível (aria-label)

---

## Footer

**Arquivo**: `src/components/Footer.tsx`

Rodapé com:

- Logo Lumen + descrição
- Ícones de redes sociais (Twitter, Instagram, YouTube) — placeholders
- Links "Explorar" e "Empresa" — placeholders
- Copyright 2026

---

## Skeletons

**Arquivo**: `src/components/Skeletons.tsx`

Componentes de loading:

- `MovieRowSkeleton`: row com 7 cards placeholder + título opcional
- `MovieGridSkeleton`: grid com N cards placeholder
- `HeroSkeleton`: banner skeleton com elementos simulados

---

## Componentes shadcn/ui

**Arquivo**: `src/components/ui/` (46 componentes)

Biblioteca de componentes acessíveis e customizáveis baseados em Radix UI:

| Componente  | Uso no projeto        |
| ----------- | --------------------- |
| Accordion   | Temporadas de série   |
| Button      | Botões em geral       |
| Dialog      | Modal trailer         |
| Sonner      | Toast notifications   |
| Command     | Paleta de comandos    |
| Hover Card  | Info em hover         |
| Carousel    | Carrosséis adicionais |
| Tabs        | Navegação por abas    |
| Avatar      | Avatares de usuário   |
| Scroll Area | Scroll customizado    |
| Progress    | Barra de progresso    |
| Sheet       | Drawer mobile         |
| Skeleton    | Loading states        |
| Tooltip     | Tooltips informativos |
| ...         | ...                   |
