ALTER TABLE "help_center" ADD COLUMN "import_site_url" text;--> statement-breakpoint
ALTER TABLE "help_center" ADD COLUMN "import_repo_url" text;--> statement-breakpoint
ALTER TABLE "help_center" ADD COLUMN "last_import_at" timestamp;--> statement-breakpoint
ALTER TABLE "help_center" ADD COLUMN "imports_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "help_center" ADD COLUMN "import_month" text;--> statement-breakpoint
ALTER TABLE "help_center" ADD COLUMN "imports_this_month" integer DEFAULT 0 NOT NULL;