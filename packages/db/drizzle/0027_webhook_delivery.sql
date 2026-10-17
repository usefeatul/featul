CREATE TABLE "webhook_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"integration_id" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp DEFAULT now() NOT NULL,
	"lock_token" text,
	"locked_until" timestamp,
	"completed_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_integration_id_workspace_integration_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."workspace_integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_delivery_post_integration_unique" ON "webhook_delivery" USING btree ("post_id","integration_id");--> statement-breakpoint
CREATE INDEX "webhook_delivery_pending_idx" ON "webhook_delivery" USING btree ("next_attempt_at") WHERE completed_at is null;