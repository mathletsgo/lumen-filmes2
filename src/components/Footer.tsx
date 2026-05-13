import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 py-8 sm:py-14">
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
      </div>
      <div className="border-t border-border/40 py-4 sm:py-6 text-center text-[10px] sm:text-xs text-muted-foreground">
        © 2026 Lumen Streaming. Todos os direitos reservados.
      </div>
    </footer>
  );
}
