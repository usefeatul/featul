CREATE TABLE "changelog_mention" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"mentioned_user_id" text NOT NULL,
	"mentioned_by" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelog_mention" ADD CONSTRAINT "changelog_mention_entry_id_changelog_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."changelog_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog_mention" ADD CONSTRAINT "changelog_mention_mentioned_user_id_user_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog_mention" ADD CONSTRAINT "changelog_mention_mentioned_by_user_id_fk" FOREIGN KEY ("mentioned_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "changelog_mention_entry_id_idx" ON "changelog_mention" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "changelog_mention_mentioned_user_id_idx" ON "changelog_mention" USING btree ("mentioned_user_id");