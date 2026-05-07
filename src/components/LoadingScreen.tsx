import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Film } from "lucide-react";

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-background grid place-items-center"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 rounded-2xl gradient-primary grid place-items-center shadow-glow animate-pulse-glow"
            >
              <Film className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center text-sm tracking-[0.3em] text-muted-foreground uppercase"
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
  return <div className={`relative overflow-hidden bg-muted/40 rounded-xl ${className}`}>
    <div className="absolute inset-0 animate-shimmer" />
  </div>;
}
