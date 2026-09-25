ALTER TABLE "changelog_entry" ADD COLUMN IF NOT EXISTS "related_post_ids" json DEFAULT '[]'::json NOT NULL;
