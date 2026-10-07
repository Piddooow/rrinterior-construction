CREATE TABLE `process_steps` (
	`id` text PRIMARY KEY NOT NULL,
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
	CONSTRAINT "process_steps_title_present" CHECK("process_steps"."title_id" IS NOT NULL OR "process_steps"."title_en" IS NOT NULL)
);
