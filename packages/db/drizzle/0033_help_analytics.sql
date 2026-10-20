CREATE TABLE "help_article_daily" (
	"article_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"helpful" integer DEFAULT 0 NOT NULL,
	"not_helpful" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "help_article_daily_article_id_day_pk" PRIMARY KEY("article_id","day")
);
--> statement-breakpoint
CREATE TABLE "help_search_daily" (
	"workspace_id" text NOT NULL,
	"day" date NOT NULL,
	"source" text NOT NULL,
	"query" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"results" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "help_search_daily_workspace_id_day_source_query_pk" PRIMARY KEY("workspace_id","day","source","query")
);
--> statement-breakpoint
ALTER TABLE "help_article_daily" ADD CONSTRAINT "help_article_daily_article_id_help_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."help_article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_article_daily" ADD CONSTRAINT "help_article_daily_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_search_daily" ADD CONSTRAINT "help_search_daily_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "help_article_daily_workspace_idx" ON "help_article_daily" USING btree ("workspace_id","day");