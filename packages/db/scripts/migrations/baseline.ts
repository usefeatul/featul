import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"
import { readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"

const root = new URL("../../../../", import.meta.url)
config({ path: new URL("apps/app/.env.local", root).pathname, quiet: true })
config({ path: new URL("apps/app/.env", root).pathname, quiet: true })
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")
const db = neon(process.env.DATABASE_URL)
const migrations = new URL("../../drizzle/", import.meta.url)
const journal = JSON.parse(await readFile(new URL("meta/_journal.json", migrations), "utf8")) as { entries: { idx: number; when: number; tag: string }[] }
const last = journal.entries.at(-1)!
const snapshot = JSON.parse(await readFile(new URL(`meta/${String(last.idx).padStart(4, "0")}_snapshot.json`, migrations), "utf8")) as { tables: Record<string, {
  name: string; columns: Record<string, { name: string; type: string; notNull: boolean; primaryKey: boolean; default?: unknown }>;
  indexes: Record<string, { name: string; isUnique: boolean; columns: { expression: string; isExpression: boolean }[] }>;
  uniqueConstraints: Record<string, { name: string; columns: string[] }>;
  foreignKeys: Record<string, { name: string; tableTo: string; columnsFrom: string[]; columnsTo: string[]; onDelete: string; onUpdate: string }>;
}> }
const columns = await db(`select table_name, column_name, data_type, udt_name, is_nullable, column_default from information_schema.columns where table_schema = 'public'`)
const indexes = await db(`select t.relname as table_name, i.relname as name, x.indisunique as unique, x.indisprimary as primary, pg_get_indexdef(i.oid) as definition from pg_index x join pg_class i on i.oid=x.indexrelid join pg_class t on t.oid=x.indrelid join pg_namespace n on n.oid=t.relnamespace where n.nspname='public'`)
const constraints = await db(`select c.conname as name, t.relname as table_name, pg_get_constraintdef(c.oid) as definition from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace where n.nspname='public'`)
const normalize = (value: unknown) => String(value ?? "").toLowerCase().replaceAll('"', '').replaceAll('public.', '').replace(/::(?:text|character varying|jsonb?|boolean|integer|bigint)/g, '').replace(/\s+/g, ' ').trim()
const normalizeType = (value: string) => value.replace("timestamp without time zone", "timestamp").replace("timestamp with time zone", "timestamp with time zone")
const problems: string[] = []
for (const table of Object.values(snapshot.tables)) {
  for (const column of Object.values(table.columns)) {
    const live = columns.find(c => c.table_name === table.name && c.column_name === column.name)
    const label = `${table.name}.${column.name}`
    if (!live) { problems.push(`Missing column ${label}`); continue }
    if (normalizeType(String(live.data_type)) !== normalizeType(column.type)) problems.push(`Type differs: ${label}`)
    if ((live.is_nullable === "NO") !== column.notNull) problems.push(`Nullability differs: ${label}`)
    if (normalize(live.column_default) !== normalize(column.default)) problems.push(`Default differs: ${label}`)
    if (column.primaryKey && !indexes.some(i => i.table_name === table.name && i.primary && normalize(i.definition).includes(`(${column.name})`))) problems.push(`Missing primary key: ${label}`)
  }
  for (const index of Object.values(table.indexes)) {
    const live = indexes.find(i => i.table_name === table.name && i.name === index.name)
    if (!live || live.unique !== index.isUnique || !normalize(live.definition).endsWith(`using btree (${index.columns.map(c => normalize(c.expression)).join(', ')})`)) problems.push(`Missing or different index: ${index.name}`)
  }
  for (const unique of Object.values(table.uniqueConstraints)) {
    if (!indexes.some(i => i.table_name === table.name && i.unique && normalize(i.definition).includes(`(${unique.columns.join(', ')})`))) problems.push(`Missing unique constraint: ${unique.name}`)
  }
  for (const fk of Object.values(table.foreignKeys)) {
    const expected = `foreign key (${fk.columnsFrom.join(', ')}) references ${fk.tableTo}(${fk.columnsTo.join(', ')})`
    const live = constraints.find(c => c.table_name === table.name && normalize(c.definition).startsWith(expected))
    const action = (kind: string) => normalize(live?.definition).match(new RegExp(`on ${kind} (cascade|restrict|set null|set default|no action)`))?.[1] || 'no action'
    if (!live || action('delete') !== fk.onDelete || action('update') !== fk.onUpdate) problems.push(`Missing or different foreign key: ${fk.name}`)
  }
}
console.log(JSON.stringify({ expectedTables: Object.keys(snapshot.tables).length, schemaProblems: problems }, null, 2))
if (problems.length) process.exit(1)
// The account-trial migration includes a data backfill, not just table creation.
const [backfill] = await db(`select count(*)::int as missing from subscription s join workspace w on w.id=s.reference_id join "user" u on u.id=w.owner_id or u.stripe_customer_id=s.stripe_customer_id left join billing_account a on a.user_id=u.id where (s.trial_start is not null or s.trial_end is not null or s.status='trialing') and a.trial_used_at is null`)
if (backfill.missing) throw new Error("Account trial backfill is incomplete; do not baseline")
if (!process.argv.includes("--apply")) { console.log("Schema verified. Use --apply to baseline an empty migration journal."); process.exit(0) }
const [state] = await db(`select to_regclass('drizzle.__drizzle_migrations') as journal`)
if (!state.journal) throw new Error("Expected existing empty Drizzle journal; inspect the database first")
const rows = await db(`select * from drizzle.__drizzle_migrations`)
if (rows.length) throw new Error("Migration journal is not empty; refusing to replace history")
const entries = await Promise.all(journal.entries.map(async entry => ({...entry, hash:createHash("sha256").update(await readFile(new URL(`${entry.tag}.sql`, migrations))).digest("hex")})))
await writeFile("/tmp/featul-migration-baseline.json", JSON.stringify({ previousJournal: rows, snapshot: last.tag, entries }, null, 2), { mode: 0o600 })
await db.transaction([
  db(`lock table drizzle.__drizzle_migrations in exclusive mode`),
  db(`select 1 / case when exists(select 1 from drizzle.__drizzle_migrations) then 0 else 1 end`),
  ...entries.map(entry => db(`insert into drizzle.__drizzle_migrations(hash,created_at) values($1,$2)`, [entry.hash, entry.when])),
])
console.log(`Baselined ${entries.length} migrations after schema and backfill verification. No application rows changed.`)
