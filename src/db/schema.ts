import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
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
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
