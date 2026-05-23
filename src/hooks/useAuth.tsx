import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Film } from "lucide-react";

export interface UserSession {
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  requireAuth: (callback: () => void) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KEY = "lumen_user_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(KEY);
      }
    }
  }, []);

  const login = useCallback((name: string, email: string) => {
    const session = { name: name.trim(), email: email.toLowerCase().trim() };
    localStorage.setItem(KEY, JSON.stringify(session));
    setUser(session);
    setIsOpen(false);
    toast.success(`Bem-vindo, ${session.name}!`);
    
    // Trigger any action that was pending authentication
    if (pendingCallback) {
      // Small timeout to allow state to settle
      setTimeout(() => {
        pendingCallback();
        setPendingCallback(null);
      }, 100);
    }
  }, [pendingCallback]);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
    toast.success("Sessão encerrada.");
    window.location.reload(); // Refresh to clean state/caches safely
  }, []);

  const requireAuth = useCallback((callback: () => void) => {
    if (user) {
      callback();
    } else {
      setPendingCallback(() => callback);
      setIsOpen(true);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Por favor, digite seu nome.");
      return;
    }
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Por favor, digite um e-mail válido.");
      return;
    }
    login(nameInput, emailInput);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requireAuth, isOpen, setIsOpen }}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border border-border/80 text-foreground p-6 rounded-2xl shadow-elevated">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl gradient-primary grid place-items-center shadow-glow mb-4">
              <Film className="w-6 h-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Identifique-se no <span className="gradient-text">LUMEN</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 max-w-sm text-sm">
              Para favoritar títulos, fazer avaliações e interagir com a comunidade, informe seu nome e e-mail.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="auth-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seu Nome / Apelido
              </Label>
              <Input
                id="auth-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="bg-muted/40 border-border/60 rounded-xl focus:border-primary py-5 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seu E-mail
              </Label>
              <Input
                id="auth-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="exemplo@email.com"
                className="bg-muted/40 border-border/60 rounded-xl focus:border-primary py-5 text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6 rounded-xl gradient-primary text-primary-foreground font-bold shadow-glow hover:scale-[1.02] transition-transform duration-300 mt-6"
            >
              Conectar e Continuar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
