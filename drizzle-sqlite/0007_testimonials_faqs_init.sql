CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text,
	`question_en` text,
	`answer_id` text,
	`answer_en` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`content_status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "faqs_question_present" CHECK("faqs"."question_id" IS NOT NULL OR "faqs"."question_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`client_display_name` text,
	`quote_id` text,
	`quote_en` text,
	`project_id` text,
	`source` text,
	`permission_confirmed` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`content_status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "testimonials_quote_present" CHECK("testimonials"."quote_id" IS NOT NULL OR "testimonials"."quote_en" IS NOT NULL)
);
