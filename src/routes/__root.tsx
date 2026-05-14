import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ChatBot } from "@/components/chat/ChatBot";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, oklch(0.7 0.27 340 / 0.25), transparent 60%)",
        }}
      />
      <div className="text-center max-w-lg">
        <h1 className="text-[10rem] sm:text-[14rem] leading-none font-black gradient-text">404</h1>
        <h2 className="mt-2 text-2xl font-bold">Cena não encontrada</h2>
        <p className="mt-3 text-muted-foreground">
          Parece que essa página saiu do roteiro. Vamos voltar ao começo?
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center mt-8 px-7 py-3 rounded-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-105 transition-transform"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lumen." },
      {
        name: "description",
        content:
          "Lumen: catálogo cinematográfico com curadoria, filmes em alta e downloads via torrent.",
      },
      { name: "theme-color", content: "#000000" },
      { property: "og:title", content: "Lumen." },
      {
        property: "og:description",
        content:
          "Lumen: catálogo cinematográfico com curadoria, filmes em alta e downloads via torrent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lumen." },
      {
        name: "twitter:description",
        content:
          "Lumen: catálogo cinematográfico com curadoria, filmes em alta e downloads via torrent.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b77a18d6-716a-4011-99a5-39ea3130fa44/id-preview-0adfdf61--194156bb-c4ed-4075-8432-3febc7383991.lovable.app-1778020427841.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b77a18d6-716a-4011-99a5-39ea3130fa44/id-preview-0adfdf61--194156bb-c4ed-4075-8432-3febc7383991.lovable.app-1778020427841.png",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingScreen />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </QueryClientProvider>
  );
}
