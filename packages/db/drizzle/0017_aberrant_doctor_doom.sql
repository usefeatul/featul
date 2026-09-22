ALTER TABLE "post" ADD COLUMN "snoozed_until" timestamp;--> statement-breakpoint
CREATE INDEX "post_snoozed_until_idx" ON "post" USING btree ("snoozed_until");