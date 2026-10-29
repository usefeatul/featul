/**
 * Database setup for self-hosted installs (selfhost/docker-compose.yml `migrate` service).
 *
 * The migration history predates a clean baseline (early tables were pushed, so 0001 fails on
 * an empty database). A fresh database therefore gets the current schema generated straight
 * from `schema/`, the hand-written routines from past migrations, and every existing
 * migration recorded as applied. Later upgrades run the normal Drizzle migrator.
 *
 *   bun scripts/selfhost/migrate.ts           apply
 *   bun scripts/selfhost/migrate.ts --print   print the fresh-install SQL instead
 */
import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"
import { readMigrationFiles } from "drizzle-orm/migrator"
import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

const packageRoot = path.resolve(import.meta.dir, "../..")
const migrationsFolder = path.join(packageRoot, "drizzle")
const MIGRATIONS_TABLE = `"drizzle"."__drizzle_migrations"`

/** Statements Drizzle can't derive from `schema/`: functions and triggers added by hand. */
function routineStatements() {
  return readMigrationFiles({ migrationsFolder })
    .flatMap((migration) => migration.sql)
    .map((statement) => statement.replace(/^(\s*--[^\n]*\n)*/, "").trim())
    .filter((statement) => /^CREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|TRIGGER)\b/i.test(statement))
}

function baselineStatements() {
  const out = mkdtempSync(path.join(tmpdir(), "featul-baseline-"))
  try {
    const result = spawnSync(
      "bunx",
      ["drizzle-kit", "generate", "--dialect", "postgresql", "--schema", "./schema/index.ts", "--out", out, "--name", "baseline"],
      { cwd: packageRoot, encoding: "utf8" },
    )
    if (result.status !== 0) throw new Error(`drizzle-kit generate failed:\n${result.stderr || result.stdout}`)
    return readMigrationFiles({ migrationsFolder: out }).flatMap((migration) => migration.sql)
  } finally {
    rmSync(out, { recursive: true, force: true })
  }
}

function freshInstallStatements() {
  const history = readMigrationFiles({ migrationsFolder })
  return [
    ...baselineStatements(),
    ...routineStatements(),
    `CREATE SCHEMA IF NOT EXISTS "drizzle"`,
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`,
    ...history.map((migration) => `INSERT INTO ${MIGRATIONS_TABLE} ("hash", "created_at") VALUES ('${migration.hash}', ${migration.folderMillis})`),
  ].map((statement) => statement.trim()).filter(Boolean)
}

// No Stripe when self-hosted: new and existing workspaces start on the full plan.
const selfHostedPlanStatements = [
  `ALTER TABLE "workspace" ALTER COLUMN "plan" SET DEFAULT 'professional'`,
  `UPDATE "workspace" SET "plan" = 'professional' WHERE "plan" <> 'professional'`,
]

if (process.argv.includes("--print")) {
  for (const statement of [...freshInstallStatements(), ...selfHostedPlanStatements]) console.log(`${statement};\n`)
  process.exit(0)
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set")
if (process.env.DATABASE_HTTP_ENDPOINT) neonConfig.fetchEndpoint = process.env.DATABASE_HTTP_ENDPOINT
const sql = neon(DATABASE_URL)

// The HTTP proxy can come up a moment after Postgres reports healthy.
for (let attempt = 1; ; attempt++) {
  try {
    await sql`select 1`
    break
  } catch (error) {
    if (attempt >= 30) throw error
    console.log(`[migrate] Waiting for the database (${attempt}/30)…`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
}

const [{ initialized }] = (await sql`select to_regclass('public.workspace') is not null as initialized`) as [{ initialized: boolean }]
if (!initialized) {
  const statements = freshInstallStatements()
  console.log(`[migrate] Empty database: creating the schema (${statements.length} statements)`)
  // One transaction, so a failed first install can simply be retried.
  await sql.transaction(statements.map((statement) => sql(statement)))
}

await migrate(drizzle(sql), { migrationsFolder })
await sql.transaction(selfHostedPlanStatements.map((statement) => sql(statement)))
console.log("[migrate] Database is up to date")
