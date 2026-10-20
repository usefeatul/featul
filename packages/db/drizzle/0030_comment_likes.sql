-- Preserve existing endorsements when replacing comment voting with likes.
-- Widget-only identities keep their existing widget votes; app/guest actors
-- are deduplicated by the reaction table's identity indexes.
INSERT INTO "comment_emoji_reaction" ("id", "comment_id", "user_id", "fingerprint", "emoji", "created_at")
SELECT 'like_' || "id", "comment_id", "user_id",
  CASE WHEN "user_id" IS NULL THEN "fingerprint" ELSE NULL END,
  '👍', "created_at"
FROM "comment_reaction"
WHERE "type" = 'upvote'
  AND "widget_user_id" IS NULL
  AND ("user_id" IS NOT NULL OR "fingerprint" IS NOT NULL)
ON CONFLICT DO NOTHING;
