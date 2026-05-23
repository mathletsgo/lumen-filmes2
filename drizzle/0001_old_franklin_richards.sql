CREATE TABLE `user_favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`media_id` text NOT NULL,
	`media_type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_media_unique` ON `user_favorites` (`user_email`,`media_id`,`media_type`);--> statement-breakpoint
ALTER TABLE `movie_reviews` ADD `author_email` text DEFAULT 'anonimo@lumen.app' NOT NULL;