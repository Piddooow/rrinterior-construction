CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_id` text,
	`title_en` text,
	`summary_id` text,
	`summary_en` text,
	`scope_of_work_id` text,
	`scope_of_work_en` text,
	`room_type` text,
	`general_location` text,
	`project_status` text,
	`year_completed` integer,
	`cover_url` text,
	`cover_role` text,
	`cover_alt_id` text,
	`cover_alt_en` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`content_status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "projects_title_present" CHECK("projects"."title_id" IS NOT NULL OR "projects"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);