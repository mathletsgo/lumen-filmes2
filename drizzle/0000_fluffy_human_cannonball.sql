CREATE TABLE `movie_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`author_name` text DEFAULT 'Anônimo' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movie_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` text NOT NULL,
	`views` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movie_views_movie_id_unique` ON `movie_views` (`movie_id`);