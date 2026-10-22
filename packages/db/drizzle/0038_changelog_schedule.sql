ALTER TABLE "changelog_entry" ADD COLUMN "scheduled_at" timestamp;--> statement-breakpoint
CREATE INDEX "changelog_entry_scheduled_at_idx" ON "changelog_entry" USING btree ("scheduled_at");