CREATE TABLE "github_issue_link" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"post_id" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"issue_number" integer NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"state" text NOT NULL,
	"state_reason" text,
	"labels" json DEFAULT '[]'::json NOT NULL,
	"linked_by" text,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_sync_settings" (
	"workspace_id" text PRIMARY KEY NOT NULL,
	"auto_status" boolean DEFAULT true NOT NULL,
	"open_status" text DEFAULT 'planned' NOT NULL,
	"progress_labels" json DEFAULT '["in progress"]'::json NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_issue_link" ADD CONSTRAINT "github_issue_link_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_issue_link" ADD CONSTRAINT "github_issue_link_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_issue_link" ADD CONSTRAINT "github_issue_link_linked_by_user_id_fk" FOREIGN KEY ("linked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_sync_settings" ADD CONSTRAINT "github_sync_settings_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "github_issue_link_post_unique" ON "github_issue_link" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "github_issue_link_issue_idx" ON "github_issue_link" USING btree ("repo_full_name","issue_number");--> statement-breakpoint
CREATE INDEX "github_issue_link_workspace_idx" ON "github_issue_link" USING btree ("workspace_id");