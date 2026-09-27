CREATE TABLE "billing_event" (
	"id" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp DEFAULT now() NOT NULL,
	"locked_until" timestamp,
	"lock_token" text
);
--> statement-breakpoint
CREATE TABLE "billing_state" (
	"workspace_id" text PRIMARY KEY NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"synced_at" timestamp,
	"attempted_at" timestamp,
	"locked_until" timestamp,
	"lock_token" text
);
--> statement-breakpoint
ALTER TABLE "billing_notification" ALTER COLUMN "sent_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "billing_notification" ALTER COLUMN "sent_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "billing_notification" ADD COLUMN "payload" jsonb;--> statement-breakpoint
ALTER TABLE "billing_notification" ADD COLUMN "locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "billing_notification" ADD COLUMN "lock_token" text;--> statement-breakpoint
ALTER TABLE "billing_state" ADD CONSTRAINT "billing_state_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "billing_event_retry_idx" ON "billing_event" USING btree ("completed_at","next_attempt_at");--> statement-breakpoint
CREATE INDEX "billing_state_sync_idx" ON "billing_state" USING btree ("synced_at");