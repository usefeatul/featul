CREATE TABLE "help_article" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"collection_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"content" json NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"not_helpful_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_center" (
	"workspace_id" text PRIMARY KEY NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_collection" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'book' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "help_article" ADD CONSTRAINT "help_article_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_article" ADD CONSTRAINT "help_article_collection_id_help_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."help_collection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_article" ADD CONSTRAINT "help_article_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_center" ADD CONSTRAINT "help_center_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_collection" ADD CONSTRAINT "help_collection_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "help_article_slug_unique" ON "help_article" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "help_article_workspace_status_idx" ON "help_article" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "help_article_collection_idx" ON "help_article" USING btree ("collection_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "help_collection_slug_unique" ON "help_collection" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "help_collection_workspace_idx" ON "help_collection" USING btree ("workspace_id","position");