import { Film, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/40">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary grid place-items-center shadow-glow">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black">
              LUMEN<span className="gradient-text">.</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Cinema sem limites. A nova forma de assistir, descobrir e se conectar com histórias.
          </p>
          <div className="flex gap-3 mt-6">
            {[Twitter, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 grid place-items-center rounded-full glass hover:bg-primary/20 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase text-muted-foreground">
            Explorar
          </h4>
          <ul className="space-y-2 text-sm">
            {["Filmes", "Séries", "Em alta", "Em breve"].map((x) => (
              <li key={x}>
                <a href="#" className="hover:text-primary transition-colors">
                  {x}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wider uppercase text-muted-foreground">
            Empresa
          </h4>
          <ul className="space-y-2 text-sm">
            {["Sobre", "Carreiras", "Imprensa", "Contato"].map((x) => (
              <li key={x}>
                <a href="#" className="hover:text-primary transition-colors">
                  {x}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © 2026 Lumen Streaming. Todos os direitos reservados.
      </div>
    </footer>
  );
}
