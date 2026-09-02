import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Film } from "lucide-react";

export function LoadingScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window !== "undefined") {
      const alreadyLoaded = sessionStorage.getItem("lumen_intro_shown");
      return !alreadyLoaded;
    }
    return false;
  });

  useEffect(() => {
    if (!show) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lumen_intro_shown", "1");
    }
    const t = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-background grid place-items-center pointer-events-none"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary grid place-items-center shadow-glow"
            >
              <Film className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="mt-4 sm:mt-6 text-center text-xs sm:text-sm tracking-[0.3em] text-muted-foreground uppercase"
            >
              LUMEN
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-muted/40 rounded-xl ${className}`}>
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}
