CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"polar_customer_id" text,
	"polar_subscription_id" text,
	"polar_product_id" text,
	"polar_price_id" text,
	"status" text,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_workspace_id_unique" UNIQUE("workspace_id"),
	CONSTRAINT "subscription_polar_customer_id_unique" UNIQUE("polar_customer_id"),
	CONSTRAINT "subscription_polar_subscription_id_unique" UNIQUE("polar_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "user_vote_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vote_aggregate" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_vote_history" CASCADE;--> statement-breakpoint
DROP TABLE "vote_aggregate" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_stripe_id_unique";--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripe_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "had_trial";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "goals";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "frequency";--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "trial_ends_at";--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "subscription_ends_at";