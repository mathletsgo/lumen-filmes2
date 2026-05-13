import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { movieViews, movieReviews } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const incrementView = createServerFn({ method: "POST" })
  .inputValidator((data: { movieId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const existing = db
        .select()
        .from(movieViews)
        .where(eq(movieViews.movieId, data.movieId))
        .get();
      let newViews = 1;
      if (existing) {
        newViews = existing.views + 1;
        db.update(movieViews)
          .set({ views: newViews })
          .where(eq(movieViews.movieId, data.movieId))
          .run();
      } else {
        db.insert(movieViews).values({ movieId: data.movieId, views: 1 }).run();
      }
      return { success: true, views: newViews };
    } catch (error) {
      console.error("Erro ao incrementar view:", error);
      return { success: false, views: 0 };
    }
  });

export const getMovieStats = createServerFn({ method: "GET" })
  .inputValidator((data: { movieId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const viewsRecord = db
        .select()
        .from(movieViews)
        .where(eq(movieViews.movieId, data.movieId))
        .get();
      const views = viewsRecord?.views || 0;

      const reviews = db
        .select()
        .from(movieReviews)
        .where(eq(movieReviews.movieId, data.movieId))
        .orderBy(desc(movieReviews.createdAt))
        .all();

      const avgRating =
        reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

      return { success: true, views, reviews, avgRating };
    } catch (error) {
      console.error("Erro ao buscar stats:", error);
      return { success: false, views: 0, reviews: [], avgRating: 0 };
    }
  });

export const addReview = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { movieId: string; rating: number; comment?: string; authorName?: string }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const name = data.authorName?.trim() || "Anônimo";
      const existing = db
        .select()
        .from(movieReviews)
        .where(and(eq(movieReviews.movieId, data.movieId), eq(movieReviews.authorName, name)))
        .get();

      if (existing) {
        db.update(movieReviews)
          .set({ rating: data.rating, comment: data.comment || "" })
          .where(eq(movieReviews.id, existing.id))
          .run();
      } else {
        db.insert(movieReviews)
          .values({
            movieId: data.movieId,
            rating: data.rating,
            comment: data.comment || "",
            authorName: name,
          })
          .run();
      }
      return { success: true };
    } catch (error) {
      console.error("Erro ao adicionar review:", error);
      return { success: false };
    }
  });

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator((data: { reviewId: number; authorName: string }) => data)
  .handler(async ({ data }) => {
    try {
      const existing = db
        .select()
        .from(movieReviews)
        .where(eq(movieReviews.id, data.reviewId))
        .get();

      if (!existing) return { success: false, error: "Avaliação não encontrada." };
      if (existing.authorName !== data.authorName)
        return { success: false, error: "Você só pode excluir suas próprias avaliações." };

      db.delete(movieReviews).where(eq(movieReviews.id, data.reviewId)).run();
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar review:", error);
      return { success: false, error: "Erro ao excluir avaliação." };
    }
  });
