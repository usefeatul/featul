CREATE TABLE "billing_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"kind" text NOT NULL,
	"stripe_event_id" text NOT NULL,
	"stripe_invoice_id" text,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_notification" ADD CONSTRAINT "billing_notification_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_notification_stripe_event_idx" ON "billing_notification" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "billing_notification_workspace_idx" ON "billing_notification" USING btree ("workspace_id","kind");