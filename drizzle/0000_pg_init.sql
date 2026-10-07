CREATE TABLE "content_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"status" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text,
	"question_en" text,
	"answer_id" text,
	"answer_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "faqs_question_present" CHECK ("faqs"."question_id" IS NOT NULL OR "faqs"."question_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"media_type" text NOT NULL,
	"media_role" text NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"name" text,
	"alt_text_id" text,
	"alt_text_en" text,
	"caption_id" text,
	"caption_en" text,
	"credit" text,
	"consent_confirmed" boolean DEFAULT false NOT NULL,
	"mime_type" text,
	"file_size" integer,
	"upload_status" text DEFAULT 'diproses' NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "process_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"title_id" text,
	"title_en" text,
	"description_id" text,
	"description_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "process_steps_title_present" CHECK ("process_steps"."title_id" IS NOT NULL OR "process_steps"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"media_id" text NOT NULL,
	"section" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_id" text,
	"title_en" text,
	"summary_id" text,
	"summary_en" text,
	"scope_of_work_id" text,
	"scope_of_work_en" text,
	"room_type" text,
	"general_location" text,
	"source_post" text,
	"project_status" text,
	"year_completed" integer,
	"cover_url" text,
	"cover_role" text,
	"cover_alt_id" text,
	"cover_alt_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_title_present" CHECK ("projects"."title_id" IS NOT NULL OR "projects"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_id" text,
	"title_en" text,
	"description_id" text,
	"description_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "services_slug_unique" UNIQUE("slug"),
	CONSTRAINT "services_title_present" CHECK ("services"."title_id" IS NOT NULL OR "services"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value_id" text,
	"value_en" text,
	"group" text DEFAULT 'umum' NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key"),
	CONSTRAINT "site_settings_value_present" CHECK ("site_settings"."value_id" IS NOT NULL OR "site_settings"."value_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "static_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_id" text,
	"title_en" text,
	"body_id" text,
	"body_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "static_pages_slug_unique" UNIQUE("slug"),
	CONSTRAINT "static_pages_title_present" CHECK ("static_pages"."title_id" IS NOT NULL OR "static_pages"."title_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"client_display_name" text,
	"quote_id" text,
	"quote_en" text,
	"project_id" text,
	"source" text,
	"permission_confirmed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "testimonials_quote_present" CHECK ("testimonials"."quote_id" IS NOT NULL OR "testimonials"."quote_en" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_revisions_entity_idx" ON "content_revisions" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "project_media_project_idx" ON "project_media" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");