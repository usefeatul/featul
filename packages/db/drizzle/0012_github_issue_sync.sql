CREATE TABLE "workspace_github_connection" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "installation_id" text NOT NULL,
  "repository_id" text NOT NULL,
  "repository_name" text NOT NULL,
  "repository_owner" text NOT NULL,
  "repository_full_name" text NOT NULL,
  "target_board_id" text,
  "label_allowlist" json DEFAULT '[]'::json NOT NULL,
  "status_label_map" json DEFAULT '{}'::json NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_sync_at" timestamp,
  "created_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "workspace_github_connection"
  ADD CONSTRAINT "workspace_github_connection_workspace_id_workspace_id_fk"
  FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workspace_github_connection"
  ADD CONSTRAINT "workspace_github_connection_target_board_id_board_id_fk"
  FOREIGN KEY ("target_board_id") REFERENCES "public"."board"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "workspace_github_connection"
  ADD CONSTRAINT "workspace_github_connection_created_by_user_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX "workspace_github_connection_workspace_unique"
  ON "workspace_github_connection" USING btree ("workspace_id");
CREATE INDEX "workspace_github_connection_workspace_idx"
  ON "workspace_github_connection" USING btree ("workspace_id");
CREATE INDEX "workspace_github_connection_installation_idx"
  ON "workspace_github_connection" USING btree ("installation_id");
CREATE INDEX "workspace_github_connection_repository_idx"
  ON "workspace_github_connection" USING btree ("repository_id");

CREATE TABLE "github_issue_link" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "post_id" text NOT NULL,
  "repository_id" text NOT NULL,
  "issue_id" text NOT NULL,
  "issue_number" text NOT NULL,
  "issue_url" text NOT NULL,
  "issue_state" text NOT NULL,
  "issue_state_reason" text,
  "issue_labels" json DEFAULT '[]'::json NOT NULL,
  "last_issue_updated_at" timestamp,
  "last_synced_at" timestamp DEFAULT now() NOT NULL,
  "suggested_roadmap_status" text,
  "suggestion_confidence" double precision,
  "suggestion_reason" text,
  "suggestion_state" text DEFAULT 'pending' NOT NULL,
  "suggested_at" timestamp,
  "last_synced_title_hash" text,
  "last_synced_body_hash" text,
  "has_content_conflict" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "github_issue_link"
  ADD CONSTRAINT "github_issue_link_workspace_id_workspace_id_fk"
  FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "github_issue_link"
  ADD CONSTRAINT "github_issue_link_post_id_post_id_fk"
  FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX "github_issue_link_workspace_repo_issue_unique"
  ON "github_issue_link" USING btree ("workspace_id", "repository_id", "issue_id");
CREATE UNIQUE INDEX "github_issue_link_workspace_post_unique"
  ON "github_issue_link" USING btree ("workspace_id", "post_id");
CREATE INDEX "github_issue_link_workspace_idx"
  ON "github_issue_link" USING btree ("workspace_id");
CREATE INDEX "github_issue_link_post_idx"
  ON "github_issue_link" USING btree ("post_id");
CREATE INDEX "github_issue_link_repository_idx"
  ON "github_issue_link" USING btree ("repository_id");
CREATE INDEX "github_issue_link_suggestion_state_idx"
  ON "github_issue_link" USING btree ("suggestion_state");
