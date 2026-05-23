import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { movieViews, movieReviews, userFavorites } from "@/db/schema";
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
    (data: { movieId: string; rating: number; comment?: string; authorName?: string; authorEmail: string }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const name = data.authorName?.trim() || "Anônimo";
      const email = data.authorEmail.toLowerCase().trim();
      const existing = db
        .select()
        .from(movieReviews)
        .where(and(eq(movieReviews.movieId, data.movieId), eq(movieReviews.authorEmail, email)))
        .get();

      if (existing) {
        db.update(movieReviews)
          .set({ rating: data.rating, comment: data.comment || "", authorName: name })
          .where(eq(movieReviews.id, existing.id))
          .run();
      } else {
        db.insert(movieReviews)
          .values({
            movieId: data.movieId,
            rating: data.rating,
            comment: data.comment || "",
            authorName: name,
            authorEmail: email,
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
  .inputValidator((data: { reviewId: number; authorEmail: string }) => data)
  .handler(async ({ data }) => {
    try {
      const existing = db
        .select()
        .from(movieReviews)
        .where(eq(movieReviews.id, data.reviewId))
        .get();

      if (!existing) return { success: false, error: "Avaliação não encontrada." };
      if (existing.authorEmail.toLowerCase().trim() !== data.authorEmail.toLowerCase().trim())
        return { success: false, error: "Você só pode excluir suas próprias avaliações." };

      db.delete(movieReviews).where(eq(movieReviews.id, data.reviewId)).run();
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar review:", error);
      return { success: false, error: "Erro ao excluir avaliação." };
    }
  });

export const toggleDbFavorite = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { mediaId: string; mediaType: "movie" | "tv"; userEmail: string }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const email = data.userEmail.toLowerCase().trim();
      const existing = db
        .select()
        .from(userFavorites)
        .where(
          and(
            eq(userFavorites.userEmail, email),
            eq(userFavorites.mediaId, data.mediaId),
            eq(userFavorites.mediaType, data.mediaType),
          ),
        )
        .get();

      if (existing) {
        db.delete(userFavorites)
          .where(eq(userFavorites.id, existing.id))
          .run();
        return { success: true, favorited: false };
      } else {
        db.insert(userFavorites)
          .values({
            userEmail: email,
            mediaId: data.mediaId,
            mediaType: data.mediaType,
          })
          .run();
        return { success: true, favorited: true };
      }
    } catch (error) {
      console.error("Erro ao alternar favorito no banco:", error);
      return { success: false, favorited: false };
    }
  });

export const getUserFavorites = createServerFn({ method: "GET" })
  .inputValidator((data: { userEmail: string }) => data)
  .handler(async ({ data }) => {
    try {
      const email = data.userEmail.toLowerCase().trim();
      const favorites = db
        .select()
        .from(userFavorites)
        .where(eq(userFavorites.userEmail, email))
        .all();
      return { success: true, favorites };
    } catch (error) {
      console.error("Erro ao buscar favoritos no banco:", error);
      return { success: false, favorites: [] };
    }
  });

export const syncUserFavorites = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userEmail: string; items: { mediaId: string; mediaType: "movie" | "tv" }[] }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const email = data.userEmail.toLowerCase().trim();
      
      // Get existing favorites
      const existing = db
        .select()
        .from(userFavorites)
        .where(eq(userFavorites.userEmail, email))
        .all();

      const existingKeys = new Set(existing.map(f => `${f.mediaType}:${f.mediaId}`));

      // Insert missing ones
      for (const item of data.items) {
        const key = `${item.mediaType}:${item.mediaId}`;
        if (!existingKeys.has(key)) {
          db.insert(userFavorites)
            .values({
              userEmail: email,
              mediaId: item.mediaId,
              mediaType: item.mediaType,
            })
            .run();
        }
      }

      // Return complete updated list
      const updated = db
        .select()
        .from(userFavorites)
        .where(eq(userFavorites.userEmail, email))
        .all();

      return { success: true, favorites: updated };
    } catch (error) {
      console.error("Erro ao sincronizar favoritos no banco:", error);
      return { success: false, favorites: [] };
    }
  });
