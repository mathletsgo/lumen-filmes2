import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { addReview, deleteReview, getMovieStats } from "@/services/dbService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const NAME_KEY = "lumen_reviewer_name";

interface Review {
  id: number;
  movieId: string;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
}

export function ReviewsSection({ movieId }: { movieId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReviewFn = useServerFn(addReview);
  const deleteReviewFn = useServerFn(deleteReview);
  const getStatsFn = useServerFn(getMovieStats);

  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setAuthorName(saved);
  }, []);

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

  const myReview = reviews.find((r) => r.authorName === (authorName.trim() || "Anônimo"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setIsSubmitting(true);
    const res = await addReviewFn({
      data: { movieId, rating, comment, authorName: authorName.trim() || "Anônimo" },
    });
    setIsSubmitting(false);

    if (res.success) {
      localStorage.setItem(NAME_KEY, authorName.trim());
      toast.success(myReview ? "Avaliação atualizada!" : "Avaliação enviada com sucesso!");
      setRating(0);
      setComment("");
      fetchReviews();
    } else {
      toast.error("Erro ao enviar avaliação.");
    }
  };

  const handleDelete = async (reviewId: number) => {
    const res = await deleteReviewFn({
      data: { reviewId, authorName: authorName.trim() || "Anônimo" },
    });
    if (res.success) {
      toast.success("Avaliação excluída.");
      fetchReviews();
    } else {
      toast.error(res.error || "Erro ao excluir.");
    }
  };

  const getInitials = (name: string) =>
    (name || "?")
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

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

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl glass-strong shadow-card relative overflow-hidden mb-8"
      >
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {myReview ? "Editar sua avaliação" : "Deixe sua avaliação"}
        </h4>

        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-2">Seu nome</label>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Como deseja ser chamado?"
            className="w-full p-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-colors text-sm"
          />
        </div>

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
                  className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-muted-foreground mb-2">
            O que você achou? (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva sua opinião..."
            className="w-full min-h-[100px] p-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none resize-y transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-70"
        >
          {isSubmitting ? (
            "Enviando..."
          ) : (
            <>
              <Send className="w-4 h-4" /> {myReview ? "Atualizar Avaliação" : "Enviar Avaliação"}
            </>
          )}
        </button>
      </form>

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
                className="p-5 rounded-2xl glass relative group"
              >
                {rev.authorName === (authorName.trim() || "Anônimo") && (
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {getInitials(rev.authorName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {rev.authorName}
                        {rev.authorName === (authorName.trim() || "Anônimo") && (
                          <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                            (você)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rev.rating ? "fill-accent text-accent" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{rev.comment}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
