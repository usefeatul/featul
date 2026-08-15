CREATE TABLE "widget_user" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL,
  "external_id" text NOT NULL,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "image" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "widget_allowed_origins" json DEFAULT '[]'::json NOT NULL;
--> statement-breakpoint
UPDATE "workspace"
SET "widget_secret" =
  replace(gen_random_uuid()::text, '-', '') ||
  replace(gen_random_uuid()::text, '-', '')
WHERE "widget_secret" IS NULL;
--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "widget_secret" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "widget_user_id" text;
--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "widget_user_id" text;
--> statement-breakpoint
ALTER TABLE "vote" ADD COLUMN "widget_user_id" text;
--> statement-breakpoint
ALTER TABLE "comment_reaction" ADD COLUMN "widget_user_id" text;
--> statement-breakpoint
ALTER TABLE "widget_user" ADD CONSTRAINT "widget_user_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_widget_user_id_widget_user_id_fk" FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_widget_user_id_widget_user_id_fk" FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_widget_user_id_widget_user_id_fk" FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comment_reaction" ADD CONSTRAINT "comment_reaction_widget_user_id_widget_user_id_fk" FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "widget_user_workspace_external_id_unique" ON "widget_user" USING btree ("workspace_id","external_id");
--> statement-breakpoint
CREATE INDEX "widget_user_workspace_email_idx" ON "widget_user" USING btree ("workspace_id","email");
--> statement-breakpoint
CREATE UNIQUE INDEX "vote_post_widget_user_unique" ON "vote" USING btree ("post_id","widget_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "vote_comment_widget_user_unique" ON "vote" USING btree ("comment_id","widget_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "comment_reaction_comment_widget_user_type_unique" ON "comment_reaction" USING btree ("comment_id","widget_user_id","type");
