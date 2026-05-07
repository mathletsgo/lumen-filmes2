import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '@/services/aiService';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { useRouterState } from '@tanstack/react-router';
import { useMovieDetails } from '@/hooks/useTmdb';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SUGGESTIONS = [
  "Filme de ação 🔥",
  "Série curta 👀",
  "Algo parecido com Dark"
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sendChatMessageFn = useServerFn(sendChatMessage);

  // Determinar o contexto atual (se estamos na página de um filme)
  const matches = useRouterState({ select: (s) => s.matches });
  const movieMatch = matches.find((m) => m.routeId === '/movie/$id');
  const movieId = (movieMatch?.params as any)?.id;
  const { data: movie } = useMovieDetails(movieId || "");

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const context = movie ? `${movie.title} (${movie.year}) - Sinopse: ${movie.synopsis}` : null;
      const res = await sendChatMessageFn({ data: { messages: newMessages, context } });
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message as Message]);
      } else {
        toast.error("Não foi possível conectar com a IA no momento.");
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-glow hover:scale-105 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-[350px] sm:max-w-[400px] h-[500px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-primary/10 border-b border-white/5">
              <div className="p-2 bg-primary/20 rounded-full">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Lumen IA</h3>
                <p className="text-xs text-muted-foreground">Especialista em Filmes & Séries</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Bot className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Olá! Sou o assistente da Lumen.</p>
                  <p className="text-xs">Como posso ajudar na sua próxima sessão de cinema?</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-white/10 text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-muted-foreground text-xs">Digitando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/5 bg-background/50">
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(suggestion)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre um filme..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
