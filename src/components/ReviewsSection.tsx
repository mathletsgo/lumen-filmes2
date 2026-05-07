import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { addReview, getMovieStats } from "@/services/dbService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: number;
  movieId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export function ReviewsSection({ movieId }: { movieId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReviewFn = useServerFn(addReview);
  const getStatsFn = useServerFn(getMovieStats);

  const fetchReviews = async () => {
    try {
      const res = await getStatsFn({ data: { movieId } });
      if (res.success) {
        setReviews(res.reviews as Review[]);
        setAvgRating(res.avgRating);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    
    setIsSubmitting(true);
    const res = await addReviewFn({ data: { movieId, rating, comment } });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Avaliação enviada com sucesso!");
      setRating(0);
      setComment("");
      fetchReviews(); // Recarrega a lista
    } else {
      toast.error("Erro ao enviar avaliação.");
    }
  };

  return (
    <div className="mt-16">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-bold">Avaliações da Comunidade</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-strong text-sm">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        {/* Formulário de Avaliação */}
        <div className="order-2 lg:order-1 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass-strong shadow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Deixe sua avaliação
            </h4>
            
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Sua nota</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-2">O que você achou do filme? (opcional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva sua opinião..."
                className="w-full min-h-[100px] p-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none resize-y transition-colors placeholder:text-muted-foreground/50 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar Avaliação</>}
            </button>
          </form>

          {/* Lista de Avaliações */}
          <div className="space-y-4">
            {loading ? (
              <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
              </div>
            ) : (
              <AnimatePresence>
                {reviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl glass"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Anônimo</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? "fill-accent text-accent" : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed whitespace-pre-wrap">
                        {rev.comment}
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
        
        {/* Espaço para propaganda ou cards relacionados no futuro, mantendo layout */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-24 p-6 rounded-2xl glass-strong text-center">
            <h4 className="font-semibold mb-2">Comunidade Lumen</h4>
            <p className="text-sm text-muted-foreground mb-4">Sua opinião ajuda outros usuários a descobrirem grandes filmes!</p>
            <div className="text-4xl font-black gradient-text">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex justify-center gap-1 mt-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reviews.length} avaliações</p>
          </div>
        </div>
      </div>
    </div>
  );
}
