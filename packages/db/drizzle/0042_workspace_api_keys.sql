CREATE TABLE "workspace_api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" json DEFAULT '[]'::json NOT NULL,
	"created_by" text,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_api_key" ADD CONSTRAINT "workspace_api_key_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_api_key" ADD CONSTRAINT "workspace_api_key_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_api_key_hash_unique" ON "workspace_api_key" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "workspace_api_key_workspace_idx" ON "workspace_api_key" USING btree ("workspace_id");