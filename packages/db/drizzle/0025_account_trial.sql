CREATE TABLE "billing_account" (
	"user_id" text PRIMARY KEY NOT NULL,
	"trial_used_at" timestamp,
	"locked_until" timestamp,
	"lock_token" text
);
--> statement-breakpoint
ALTER TABLE "billing_account" ADD CONSTRAINT "billing_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "billing_account" ("user_id", "trial_used_at")
SELECT u.id, min(coalesce(s.trial_start, s.trial_end, s.created_at))
FROM "subscription" s
JOIN "workspace" w ON w.id = s.reference_id
JOIN "user" u ON u.id = w.owner_id OR u.stripe_customer_id = s.stripe_customer_id
WHERE s.trial_start IS NOT NULL OR s.trial_end IS NOT NULL OR s.status = 'trialing'
GROUP BY u.id
ON CONFLICT ("user_id") DO NOTHING;
