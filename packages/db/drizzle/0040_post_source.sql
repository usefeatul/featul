ALTER TABLE "post" ADD COLUMN "source" text;--> statement-breakpoint
UPDATE "post" SET "source" = 'widget' WHERE "widget_user_id" IS NOT NULL;--> statement-breakpoint
UPDATE "post" SET "source" = CASE split_part("metadata"->'customFields'->>'importSourceId', '_', 1) WHEN 'canny' THEN 'canny' WHEN 'nolt' THEN 'nolt' WHEN 'productboard' THEN 'productboard' ELSE 'csv' END WHERE "source" IS NULL AND ("metadata"->'customFields'->>'importSourceId') IS NOT NULL;--> statement-breakpoint
UPDATE "post" SET "source" = 'board' WHERE "source" IS NULL AND EXISTS (SELECT 1 FROM "activity_log" a WHERE a."entity" = 'post' AND a."action" = 'post_created' AND a."entity_id" = "post"."id");
