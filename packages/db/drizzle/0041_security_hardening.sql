ALTER TABLE "workspace_slug_reservation" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
-- Existing reservations predate email confirmation; keep them holding their slugs.
UPDATE "workspace_slug_reservation" SET "confirmed_at" = COALESCE("updated_at", "created_at") WHERE "confirmed_at" IS NULL AND "status" IN ('reserved', 'claimed');--> statement-breakpoint
-- Keep the earliest report per reporter before enforcing uniqueness.
DELETE FROM "post_report" a USING "post_report" b WHERE a."post_id" = b."post_id" AND a."reported_by" = b."reported_by" AND (a."created_at", a."id") > (b."created_at", b."id");--> statement-breakpoint
DELETE FROM "comment_report" a USING "comment_report" b WHERE a."comment_id" = b."comment_id" AND a."reported_by" = b."reported_by" AND (a."created_at", a."id") > (b."created_at", b."id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_report_post_reporter_unique" ON "post_report" USING btree ("post_id","reported_by");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_report_comment_reporter_unique" ON "comment_report" USING btree ("comment_id","reported_by");
