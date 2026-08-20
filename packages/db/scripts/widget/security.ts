import { config as loadEnv } from "dotenv";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

for (const envFile of [".env", ".env.local"]) {
  loadEnv({ path: path.resolve(process.cwd(), "../../apps/app", envFile) });
}
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(DATABASE_URL);

async function columnExists(table: string, column: string) {
  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function tableExists(table: string) {
  const rows = await sql`
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ${table}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function main() {
  if (!(await tableExists("widget_user"))) {
    await sql`
      CREATE TABLE "widget_user" (
        "id" text PRIMARY KEY NOT NULL,
        "workspace_id" text NOT NULL,
        "external_id" text NOT NULL,
        "email" text NOT NULL,
        "name" text NOT NULL,
        "image" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("Created widget_user table");
  }

  if (!(await columnExists("workspace", "widget_allowed_origins"))) {
    await sql`
      ALTER TABLE "workspace"
      ADD COLUMN "widget_allowed_origins" json DEFAULT '[]'::json NOT NULL
    `;
    console.log("Added workspace.widget_allowed_origins");
  }

  await sql`
    UPDATE "workspace"
    SET "widget_secret" =
      replace(gen_random_uuid()::text, '-', '') ||
      replace(gen_random_uuid()::text, '-', '')
    WHERE "widget_secret" IS NULL
  `;
  console.log("Backfilled null widget_secret values");

  await sql`
    ALTER TABLE "workspace"
    ALTER COLUMN "widget_secret" SET NOT NULL
  `;
  console.log("Set workspace.widget_secret NOT NULL");

  if (!(await columnExists("post", "widget_user_id"))) {
    await sql`ALTER TABLE "post" ADD COLUMN "widget_user_id" text`;
    console.log("Added post.widget_user_id");
  }
  if (!(await columnExists("comment", "widget_user_id"))) {
    await sql`ALTER TABLE "comment" ADD COLUMN "widget_user_id" text`;
    console.log("Added comment.widget_user_id");
  }
  if (!(await columnExists("vote", "widget_user_id"))) {
    await sql`ALTER TABLE "vote" ADD COLUMN "widget_user_id" text`;
    console.log("Added vote.widget_user_id");
  }
  if (!(await columnExists("comment_reaction", "widget_user_id"))) {
    await sql`ALTER TABLE "comment_reaction" ADD COLUMN "widget_user_id" text`;
    console.log("Added comment_reaction.widget_user_id");
  }

  await sql`
    DO $$ BEGIN
      ALTER TABLE "widget_user"
        ADD CONSTRAINT "widget_user_workspace_id_workspace_id_fk"
        FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE "post"
        ADD CONSTRAINT "post_widget_user_id_widget_user_id_fk"
        FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE "comment"
        ADD CONSTRAINT "comment_widget_user_id_widget_user_id_fk"
        FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE "vote"
        ADD CONSTRAINT "vote_widget_user_id_widget_user_id_fk"
        FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE "comment_reaction"
        ADD CONSTRAINT "comment_reaction_widget_user_id_widget_user_id_fk"
        FOREIGN KEY ("widget_user_id") REFERENCES "public"."widget_user"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "widget_user_workspace_external_id_unique"
      ON "widget_user" USING btree ("workspace_id","external_id")
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "widget_user_workspace_email_idx"
      ON "widget_user" USING btree ("workspace_id","email")
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "vote_post_widget_user_unique"
      ON "vote" USING btree ("post_id","widget_user_id")
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "vote_comment_widget_user_unique"
      ON "vote" USING btree ("comment_id","widget_user_id")
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "comment_reaction_comment_widget_user_type_unique"
      ON "comment_reaction" USING btree ("comment_id","widget_user_id","type")
  `;

  console.log("Widget security migration applied");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
