ALTER TABLE "changelog_entry" ADD COLUMN "source_provider" text;
ALTER TABLE "changelog_entry" ADD COLUMN "source_external_id" text;
ALTER TABLE "changelog_entry" ADD COLUMN "source_imported_at" timestamp;
CREATE UNIQUE INDEX "changelog_entry_source_unique" ON "changelog_entry" USING btree ("board_id","source_provider","source_external_id");
CREATE INDEX "changelog_entry_source_idx" ON "changelog_entry" USING btree ("source_provider","source_external_id");

CREATE TABLE "workspace_notra_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"encrypted_api_key" text NOT NULL,
	"key_version" text DEFAULT 'v1' NOT NULL,
	"created_by" text,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "workspace_notra_connection" ADD CONSTRAINT "workspace_notra_connection_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workspace_notra_connection" ADD CONSTRAINT "workspace_notra_connection_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
CREATE UNIQUE INDEX "workspace_notra_connection_workspace_unique" ON "workspace_notra_connection" USING btree ("workspace_id");
CREATE INDEX "workspace_notra_connection_workspace_idx" ON "workspace_notra_connection" USING btree ("workspace_id");
