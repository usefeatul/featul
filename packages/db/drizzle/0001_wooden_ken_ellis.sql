ALTER TABLE "board_category" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "post_view" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "branding_asset" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "custom_theme" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "board_category" CASCADE;--> statement-breakpoint
DROP TABLE "post_view" CASCADE;--> statement-breakpoint
DROP TABLE "branding_asset" CASCADE;--> statement-breakpoint
DROP TABLE "custom_theme" CASCADE;--> statement-breakpoint
ALTER TABLE "post" DROP CONSTRAINT "post_category_id_board_category_id_fk";
--> statement-breakpoint
ALTER TABLE "tag" DROP CONSTRAINT "tag_board_id_board_id_fk";
--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "is_public" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "allow_anonymous" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "require_approval" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "allow_voting" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "allow_comments" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "sort_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "roadmap_statuses" SET DEFAULT '[{"id":"pending","name":"Pending","color":"#6b7280","order":0},{"id":"review","name":"Review","color":"#a855f7","order":1},{"id":"planned","name":"Planned","color":"#6b7280","order":2},{"id":"progress","name":"Progress","color":"#f59e0b","order":3},{"id":"completed","name":"Completed","color":"#10b981","order":4},{"id":"closed","name":"Closed","color":"#ef4444","order":5}]'::json;--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "roadmap_statuses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_moderator" ALTER COLUMN "permissions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_moderator" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "domain" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD COLUMN "permissions" json DEFAULT '{"canManageWorkspace":false,"canManageBilling":false,"canManageMembers":false,"canManageBoards":false,"canModerateAllBoards":false,"canConfigureBranding":false}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "system_type" text;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "is_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "hide_public_member_identity" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "author_image" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "duplicate_of_id" uuid;--> statement-breakpoint
ALTER TABLE "tag" ADD COLUMN "workspace_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_duplicate_of_id_post_id_fk" FOREIGN KEY ("duplicate_of_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_id_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_aggregate" ADD CONSTRAINT "vote_aggregate_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_invite_workspace_email_unique" ON "workspace_invite" USING btree ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "workspace_invite_workspace_idx" ON "workspace_invite" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_invite_workspace_active_idx" ON "workspace_invite" USING btree ("workspace_id","expires_at","accepted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_member_workspace_user_unique" ON "workspace_member" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_member_workspace_idx" ON "workspace_member" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_member_workspace_active_idx" ON "workspace_member" USING btree ("workspace_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "board_slug_workspace_unique" ON "board" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "board_workspace_id_idx" ON "board" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "board_is_system_idx" ON "board" USING btree ("is_system");--> statement-breakpoint
CREATE UNIQUE INDEX "board_moderator_board_user_unique" ON "board_moderator" USING btree ("board_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_slug_board_unique" ON "post" USING btree ("board_id","slug");--> statement-breakpoint
CREATE INDEX "post_board_id_idx" ON "post" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "post_roadmap_status_idx" ON "post" USING btree ("roadmap_status");--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "post" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "post_tag_unique" ON "post_tag" USING btree ("post_id","tag_id");--> statement-breakpoint
CREATE INDEX "post_tag_post_id_idx" ON "post_tag" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_tag_tag_id_idx" ON "post_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_slug_workspace_unique" ON "tag" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_reaction_comment_user_type_unique" ON "comment_reaction" USING btree ("comment_id","user_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "vote_post_user_unique" ON "vote" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vote_comment_user_unique" ON "vote" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vote_post_anon_unique" ON "vote" USING btree ("post_id","ip_address","fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "vote_comment_anon_unique" ON "vote" USING btree ("comment_id","ip_address","fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "vote_aggregate_target_unique" ON "vote_aggregate" USING btree ("post_id","comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branding_workspace_unique" ON "branding_config" USING btree ("workspace_id");--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "board" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "board" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "board" DROP COLUMN "color";--> statement-breakpoint
ALTER TABLE "board" DROP COLUMN "icon";--> statement-breakpoint
ALTER TABLE "board" DROP COLUMN "welcome_message";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "effort";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "downvotes";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "view_count";--> statement-breakpoint
ALTER TABLE "tag" DROP COLUMN "board_id";--> statement-breakpoint
ALTER TABLE "comment" DROP COLUMN "downvotes";--> statement-breakpoint
ALTER TABLE "user_vote_history" DROP COLUMN "downvotes_given";--> statement-breakpoint
ALTER TABLE "vote_aggregate" DROP COLUMN "downvotes";--> statement-breakpoint
ALTER TABLE "vote_aggregate" DROP COLUMN "score";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "logo_url";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "logo_width";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "logo_height";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "favicon_url";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "secondary_color";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "accent_color";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "background_color";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "text_color";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "custom_css";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "font_family";--> statement-breakpoint
ALTER TABLE "branding_config" DROP COLUMN "font_size";