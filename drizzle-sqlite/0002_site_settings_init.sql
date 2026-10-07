CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value_id` text,
	`value_en` text,
	`group` text DEFAULT 'umum' NOT NULL,
	`updated_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "site_settings_value_present" CHECK("site_settings"."value_id" IS NOT NULL OR "site_settings"."value_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);