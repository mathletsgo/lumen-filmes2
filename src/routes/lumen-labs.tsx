import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Info, Heart, Share2, Star } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/lumen-labs")({
  component: LumenLabs,
});

const AshParticles = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {[...Array(50)].map((_, i) => {
        const size = Math.random() * 4 + 1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-orange-400 mix-blend-screen"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              filter: `blur(${Math.random() * 1.5}px)`,
              boxShadow: "0 0 12px 2px rgba(249, 115, 22, 0.8)",
            }}
            animate={{
              y: [0, -1200 - Math.random() * 500],
              x: Math.random() * 300 - 150,
              opacity: [0, Math.random() * 0.8 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        );
      })}
    </div>
  );
};

function LumenLabs() {
  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-sans">
      {/* Background layer with slow breathing pan (Ken Burns) */}
      <div className="absolute inset-0 w-full h-full">
        <motion.img
          initial={{ scale: 1.05, x: 0, y: 0 }}
          animate={{ scale: 1.15, x: -30, y: -15 }}
          transition={{ duration: 40, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          src="https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg"
          alt="Avatar Backdrop"
          className="w-full h-full object-cover object-center opacity-80"
        />
        
        {/* Dynamic Fog Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-blue-900/20 mix-blend-screen pointer-events-none blur-[100px]"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Cinematic Dark Overlays for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
      </div>

      <AshParticles />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-50">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Lumen</span>
        </Link>
        <div className="flex items-center gap-2 text-orange-400 font-bold tracking-widest uppercase text-xs bg-orange-500/10 backdrop-blur-md border border-orange-500/20 px-5 py-2.5 rounded-full shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]">
          <span>Labs: Cinematic Details</span>
        </div>
      </nav>

      {/* Main Content Area - Bottom Aligned */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-16 max-w-[1600px] mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="max-w-3xl pointer-events-auto"
        >
          {/* Tag & Rating */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 font-bold text-white text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              8.5 TMDB
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
              2025
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
              Ficção Científica
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
              3h 12m
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-tighter leading-[1.1]">
            AVATAR
            <span className="block text-4xl md:text-6xl lg:text-7xl mt-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-500 to-red-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
              FOGO E CINZAS
            </span>
          </h1>

          {/* Synopsis */}
          <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed mb-10 drop-shadow-md line-clamp-3 md:line-clamp-none max-w-2xl mix-blend-screen">
            Mais de uma década após os eventos de The Way of Water, Jake Sully e sua família
            enfrentam uma nova e implacável tribo Na'vi do Povo das Cinzas. Uma jornada visualmente
            deslumbrante através dos vulcões para proteger tudo o que aprenderam a amar.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold transition-all duration-300 hover:scale-105 hover:bg-gray-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)]">
              <Play className="w-5 h-5 fill-current" />
              Assistir Filme
            </button>
            <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              <Play className="w-5 h-5" />
              Trailer Oficial
            </button>
            <button className="flex items-center justify-center gap-3 px-5 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              <Heart className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center gap-3 px-5 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Dynamic Right Side: Cast / Extras */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="absolute right-8 md:right-16 bottom-16 md:bottom-24 hidden lg:flex flex-col gap-4 w-80 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold tracking-wide drop-shadow-md">Elenco Principal</h3>
            <span className="text-xs text-white/60 cursor-pointer hover:text-white transition-colors">Ver todos</span>
          </div>
          
          {[
            { name: "Sam Worthington", role: "Jake Sully", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" },
            { name: "Zoe Saldaña", role: "Neytiri", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop" },
            { name: "Oona Chaplin", role: "Varang", img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop" }
          ].map((actor, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:translate-x-[-8px] cursor-pointer group shadow-[0_0_15px_-5px_rgba(0,0,0,0.5)]">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border border-white/20 shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <img src={actor.img} alt={actor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>
              <div>
                <p className="text-white text-sm font-bold group-hover:text-orange-300 transition-colors">{actor.name}</p>
                <p className="text-white/60 text-xs mt-0.5">{actor.role}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
