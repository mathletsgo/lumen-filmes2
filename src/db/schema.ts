import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const movieViews = sqliteTable("movie_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  movieId: text("movie_id").notNull().unique(),
  views: integer("views").notNull().default(1),
});

export const movieReviews = sqliteTable("movie_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  movieId: text("movie_id").notNull(),
  rating: integer("rating").notNull(), // 1 a 5
  comment: text("comment"),
  authorName: text("author_name").notNull().default("Anônimo"),
  authorEmail: text("author_email").notNull().default("anonimo@lumen.app"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userFavorites = sqliteTable("user_favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  mediaId: text("media_id").notNull(),
  mediaType: text("media_type").notNull(), // 'movie' | 'tv'
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userMediaUnique: uniqueIndex("user_media_unique").on(table.userEmail, table.mediaId, table.mediaType),
}));
