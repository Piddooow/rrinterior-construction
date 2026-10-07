CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_id` text,
	`title_en` text,
	`description_id` text,
	`description_en` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`content_status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "services_title_present" CHECK("services"."title_id" IS NOT NULL OR "services"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);