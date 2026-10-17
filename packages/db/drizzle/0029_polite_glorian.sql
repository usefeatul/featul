CREATE TABLE "comment_emoji_reaction" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"user_id" text,
	"fingerprint" text,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comment_emoji_actor_check" CHECK (("comment_emoji_reaction"."user_id" is not null) <> ("comment_emoji_reaction"."fingerprint" is not null))
);
--> statement-breakpoint
ALTER TABLE "comment_emoji_reaction" ADD CONSTRAINT "comment_emoji_reaction_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_emoji_reaction" ADD CONSTRAINT "comment_emoji_reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "comment_emoji_user_unique" ON "comment_emoji_reaction" USING btree ("comment_id","user_id","emoji");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_emoji_fingerprint_unique" ON "comment_emoji_reaction" USING btree ("comment_id","fingerprint","emoji");