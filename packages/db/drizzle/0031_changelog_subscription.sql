CREATE TABLE "changelog_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelog_subscription" ADD CONSTRAINT "changelog_subscription_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changelog_subscription" ADD CONSTRAINT "changelog_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "changelog_subscription_workspace_user_unique" ON "changelog_subscription" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "changelog_subscription_token_unique" ON "changelog_subscription" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE INDEX "changelog_subscription_workspace_idx" ON "changelog_subscription" USING btree ("workspace_id");