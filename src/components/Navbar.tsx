import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Heart, Menu, X, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchOverlay } from "./SearchOverlay";

const links = [
  { to: "/", label: "Início" },
  { to: "/categories", label: "Categorias" },
  { to: "/favorites", label: "Favoritos" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <nav
            className={`flex items-center justify-between gap-4 px-4 sm:px-6 py-3 rounded-2xl transition-all duration-500 ${
              scrolled ? "glass-strong shadow-card" : "bg-transparent"
            }`}
          >
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl gradient-primary grid place-items-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Film className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black tracking-tight">
                LUMEN<span className="gradient-text">.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => {
                const active = path === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-foreground/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 grid place-items-center rounded-full hover:bg-foreground/10 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                to="/favorites"
                className="hidden sm:grid w-10 h-10 place-items-center rounded-full hover:bg-foreground/10 transition-colors"
                aria-label="Favoritos"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-foreground/10 transition-colors"
                aria-label="Menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-md md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 glass-strong p-6 pt-24 md:hidden"
            >
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      path === l.to
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
