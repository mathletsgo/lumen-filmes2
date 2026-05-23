import { useState } from "react";
import { Star, MessageSquare, Send, Trash2, ShieldAlert } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { addReview, deleteReview, getMovieStats } from "@/services/dbService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  id: number;
  movieId: string;
  rating: number;
  comment: string | null;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export function ReviewsSection({ movieId }: { movieId: string }) {
  const { user, requireAuth, logout } = useAuth();
  const getStatsFn = useServerFn(getMovieStats);
  const addReviewFn = useServerFn(addReview);
  const deleteReviewFn = useServerFn(deleteReview);
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["movieStats", movieId],
    queryFn: () => getStatsFn({ data: { movieId } }),
    staleTime: 1000 * 5, // 5 seconds
  });

  const reviews = (stats?.reviews || []) as Review[];
  const avgRating = stats?.avgRating || 0;

  const myReview = user
    ? reviews.find((r) => r.authorEmail.toLowerCase().trim() === user.email.toLowerCase().trim())
    : null;

  const addReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      addReviewFn({
        data: {
          movieId,
          rating: data.rating,
          comment: data.comment,
          authorName: user?.name || "Anônimo",
          authorEmail: user?.email || "",
        },
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(myReview ? "Avaliação atualizada!" : "Avaliação enviada com sucesso!");
        setRating(0);
        setComment("");
        queryClient.invalidateQueries({ queryKey: ["movieStats", movieId] });
      } else {
        toast.error("Erro ao enviar avaliação.");
      }
    },
    onError: () => {
      toast.error("Erro ao enviar avaliação.");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) =>
      deleteReviewFn({
        data: { reviewId, authorEmail: user?.email || "" },
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Avaliação excluída.");
        queryClient.invalidateQueries({ queryKey: ["movieStats", movieId] });
      } else {
        toast.error(res.error || "Erro ao excluir.");
      }
    },
    onError: () => {
      toast.error("Erro na requisição para excluir.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requireAuth(() => {});
      return;
    }
    if (rating === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    addReviewMutation.mutate({ rating, comment });
  };

  const handleDelete = (reviewId: number) => {
    if (!user) return;
    deleteReviewMutation.mutate(reviewId);
  };

  const getInitials = (name: string) =>
    (name || "?")
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const isSubmitting = addReviewMutation.isPending;

  return (
    <div className="mt-16">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-bold">Avaliações da Comunidade</h3>
        {!isLoading && reviews.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-strong text-sm">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 animate-pulse-glow" />
            <span className="font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl glass-strong shadow-card relative overflow-hidden"
        >
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {myReview ? "Editar sua avaliação" : "Deixe sua avaliação"}
          </h4>

          {/* User profile state */}
          {user ? (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-background/40 border border-border/60">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary border border-primary/30 shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 cursor-pointer font-medium"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 mb-6 rounded-xl border border-dashed border-border/80 bg-background/20">
              <ShieldAlert className="w-8 h-8 text-primary/80 mb-2" />
              <p className="text-sm font-bold text-foreground">Você precisa se conectar para avaliar</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Conecte-se para compartilhar sua nota e comentários com a comunidade.
              </p>
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className="mt-4 px-6 py-2.5 rounded-full gradient-primary text-primary-foreground text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105 cursor-pointer shadow-glow"
              >
                Entrar agora
              </button>
            </div>
          )}

          {/* Inputs Section */}
          <div className={!user ? "opacity-30 pointer-events-none select-none" : ""}>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2 font-medium">Sua nota</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!user || isSubmitting}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer disabled:cursor-default"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-2 font-medium">
                O que você achou? (opcional)
              </label>
              <textarea
                value={comment}
                disabled={!user || isSubmitting}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva sua opinião sincera sobre este título..."
                className="w-full min-h-[120px] p-4 rounded-xl bg-background/50 border border-border/80 focus:border-primary outline-none resize-y transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!user || isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4" /> {myReview ? "Atualizar Avaliação" : "Enviar Avaliação"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Reviews List Column */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-hidden">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 rounded-2xl glass border border-border/40 animate-pulse flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/60" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted/60 rounded w-1/3" />
                      <div className="h-2.5 bg-muted/40 rounded w-1/5" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted/40 rounded w-full mt-2" />
                  <div className="h-3 bg-muted/40 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 text-muted-foreground bg-background/10">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">Nenhuma avaliação ainda</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Seja o primeiro a dar sua opinião!</p>
            </div>
          ) : (
            <AnimatePresence>
              {reviews.map((rev) => {
                const isMyReview = user && rev.authorEmail.toLowerCase().trim() === user.email.toLowerCase().trim();
                return (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl glass relative group border border-border/20 hover:border-border/40 transition-colors"
                  >
                    {isMyReview && (
                      <button
                        onClick={() => handleDelete(rev.id)}
                        disabled={deleteReviewMutation.isPending}
                        className="absolute top-3.5 right-3.5 w-7 h-7 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all cursor-pointer disabled:opacity-40"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    )}
                    <div className="flex items-center justify-between mb-3 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/30 shadow-sm shrink-0">
                          {getInitials(rev.authorName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {rev.authorName}
                            {isMyReview && (
                              <span className="text-[10px] text-primary/80 ml-1.5 font-semibold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                você
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shadow-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= rev.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs sm:text-sm text-foreground/90 mt-2 leading-relaxed whitespace-pre-wrap pl-1 break-words">
                        {rev.comment}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
