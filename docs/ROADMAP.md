# Roadmap

## Fase 1 — MVP Atual ✅

- [x] Catálogo de filmes e séries via TMDB
- [x] Hero banner com carrossel cinematográfico
- [x] Páginas de detalhes com elenco, trailer e sinopse
- [x] Temporadas e episódios para séries
- [x] Seção de animes com filtro por gênero
- [x] Busca com correção semântica por IA (GPT-4o-mini)
- [x] Chatbot contextual com IA
- [x] Favoritos (localStorage)
- [x] Avaliações da comunidade (nota + comentário)
- [x] Contagem de visualizações
- [x] Design responsivo com tema escuro cinematográfico
- [x] Skeleton loading em todas as seções
- [x] Tratamento de erros e página 404
- [x] Deploy em Cloudflare Workers + Vercel

## Fase 2 — Próximas Features 🚀

- [ ] **Autenticação real** — email + senha ou OAuth (Google, GitHub)
- [ ] **Sincronização de favoritos** — salvar no servidor, não só localStorage
- [ ] **Listas personalizadas** — "Assistir depois", "Já assistidos"
- [ ] **Streaming real** — player de vídeo integrado
- [ ] **Notificações push** — lançamentos, novos episódios
- [ ] **Compartilhamento** — links, listas entre usuários
- [ ] **Perfil customizável** — avatar, banner, biografia
- [ ] **Recomendações por IA** — baseadas no histórico do usuário

## Fase 3 — Expansão 🌟

- [ ] **Modo claro** — tema alternativo
- [ ] **Tema customizável** — cores, fontes, layout
- [ ] **i18n** — suporte a múltiplos idiomas (inglês, espanhol)
- [ ] **PWA** — aplicativo progressivo, instalação no dispositivo
- [ ] **App mobile** — React Native ou PWA avançado
- [ ] **Integração JustWatch** — onde assistir cada título
- [ ] **Admin panel** — moderação de avaliações, analytics
- [ ] **Analytics** — dashboard de audiência

## Fase 4 — Monetização 💰

- [ ] **Plano Free** — catálogo + buscas + avaliações
- [ ] **Plano Premium** — downloads, 4K, sem anúncios
- [ ] **Plano Premium Plus** — conteúdo exclusivo, early access
- [ ] **Anúncios** — banner ads no plano gratuito
- [ ] **Links de afiliado** — Amazon, Netflix, etc.
- [ ] **Conteúdo patrocinado** — destaque pago
- [ ] **API Premium** — acesso para terceiros

---

# Checklist de Melhorias

## Performance

- [ ] Code splitting por rota (`React.lazy`)
- [ ] Otimização de imagens (WebP, AVIF, CDN)
- [ ] Virtualização de listas com `react-window` ou `@tanstack/virtual`
- [ ] Paginação real nas chamadas TMDB (atualmente página 1 apenas)
- [ ] Service Worker + cache de assets
- [ ] Bundle analysis (`vite-bundle-visualizer`)

## Segurança

- [ ] Rate limiting nas server functions
- [ ] CSP Headers (Content-Security-Policy)
- [ ] Sanitização de inputs (comentários, busca)
- [ ] Sistema de autenticação completo
- [ ] Logs sanitizados (sem expor tokens)

## Qualidade

- [ ] Testes unitários (Vitest + Testing Library)
- [ ] Testes de integração nas server functions
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Code review guidelines

## UX

- [ ] Modo claro
- [ ] Acessibilidade WCAG 2.1 (contraste, teclado, screen readers)
- [ ] Feedback tátil em dispositivos móveis
- [ ] Suporte a `prefers-reduced-motion`
- [ ] Offline fallback com Service Worker
- [ ] Micro-interações (haptic, som)

## SEO

- [ ] Meta tags dinâmicas com dados reais do filme/série
- [ ] Sitemap.xml gerado automaticamente
- [ ] Structured Data JSON-LD (Schema.org/Movie)
- [ ] Open Graph images customizadas por título
- [ ] Robots.txt

## Arquitetura

- [ ] Banco de dados escalável (Turso/Neon)
- [ ] Cache Redis para respostas TMDB
- [ ] Error boundaries granulares por seção
- [ ] Middleware de logging e monitoramento
- [ ] Documentação de API automatizada

---

# Sugestões de Monetização

## Modelo Freemium

| Plano            | Preço        | Recursos                                            |
| ---------------- | ------------ | --------------------------------------------------- |
| **Free**         | Grátis       | Catálogo, busca, avaliações, recomendações básicas  |
| **Premium**      | R$ 9,90/mês  | Downloads offline, qualidade 4K, sem anúncios       |
| **Premium Plus** | R$ 19,90/mês | Tudo do Premium + conteúdo exclusivo + early access |

## Fontes de Receita

| Modelo                   | Descrição                                                    |
| ------------------------ | ------------------------------------------------------------ |
| **Assinatura**           | Planos mensais/anuais recorrentes                            |
| **Anúncios**             | Banner ads e video ads (plano gratuito)                      |
| **Links de Afiliado**    | Comissão por assinaturas em serviços parceiros               |
| **Conteúdo Patrocinado** | Destaque pago para estúdios e distribuidoras                 |
| **API Premium**          | Acesso à API de recomendações para desenvolvedores terceiros |
