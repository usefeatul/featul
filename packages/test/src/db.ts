import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../../db/schema/index";
import { getWorkspaceRoot, loadTestEnv } from "./env";

export type TestDatabase = {
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
  url: string;
};

function assertSafeDatabaseUrl(databaseUrl: string) {
  const parsed = new URL(databaseUrl);
  const protocol = parsed.protocol.toLowerCase();
  const dbName = parsed.pathname.replace(/^\//, "");
  const host = parsed.hostname.toLowerCase();

  if (protocol !== "postgresql:" && protocol !== "postgres:") {
    throw new Error(`Unsupported test database protocol: ${protocol}`);
  }

  if (!dbName || !dbName.toLowerCase().includes("test")) {
    throw new Error(
      `Refusing to use a non-test database name for automated tests: ${dbName || "<empty>"}`,
    );
  }

  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(
      `Refusing to use a non-local database host for automated tests: ${host}`,
    );
  }
}

export function getTestDatabaseUrl(): string {
  loadTestEnv();

  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for the test database");
  }

  assertSafeDatabaseUrl(databaseUrl);
  return databaseUrl;
}

export function createTestDatabase(databaseUrl = getTestDatabaseUrl()): TestDatabase {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  return {
    db: drizzle(pool, { schema }),
    pool,
    url: databaseUrl,
  };
}

export async function migrateTestDatabase(testDatabase: TestDatabase): Promise<void> {
  await migrate(testDatabase.db, {
    migrationsFolder: `${getWorkspaceRoot()}/packages/db/drizzle`,
  });
}

export async function recreatePublicSchema(testDatabase: TestDatabase): Promise<void> {
  await testDatabase.pool.query("drop schema if exists public cascade");
  await testDatabase.pool.query("drop schema if exists drizzle cascade");
  await testDatabase.pool.query("create schema public");
}

export async function resetTestDatabase(testDatabase: TestDatabase): Promise<void> {
  const tables = await testDatabase.pool.query<{ tablename: string }>(`
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename <> '__drizzle_migrations'
  `);

  if (tables.rows.length === 0) return;

  const identifiers = tables.rows
    .map(({ tablename }) => `"${tablename.replace(/"/g, "\"\"")}"`)
    .join(", ");

  await testDatabase.pool.query(
    `truncate table ${identifiers} restart identity cascade`,
  );
}

export async function closeTestDatabase(testDatabase: TestDatabase): Promise<void> {
  await testDatabase.pool.end();
}
