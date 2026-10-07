CREATE TABLE `static_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_id` text,
	`title_en` text,
	`body_id` text,
	`body_en` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`content_status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "static_pages_title_present" CHECK("static_pages"."title_id" IS NOT NULL OR "static_pages"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `static_pages_slug_unique` ON `static_pages` (`slug`);