CREATE TABLE "changelog_ai_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"entry_id" text,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"messages" json DEFAULT '[]'::json NOT NULL,
	"selected_post_ids" json DEFAULT '[]'::json NOT NULL,
	"pending_tag_names" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelog_ai_conversation" ADD CONSTRAINT "changelog_ai_conversation_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "changelog_ai_conversation" ADD CONSTRAINT "changelog_ai_conversation_entry_id_changelog_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."changelog_entry"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "changelog_ai_conversation" ADD CONSTRAINT "changelog_ai_conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "changelog_ai_conversation_owner_idx" ON "changelog_ai_conversation" USING btree ("board_id","user_id","updated_at");
--> statement-breakpoint
CREATE INDEX "changelog_ai_conversation_entry_idx" ON "changelog_ai_conversation" USING btree ("entry_id");
