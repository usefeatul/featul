import { expect, mock, test } from "bun:test";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
// The query builder requires a URL at import time; these tests never connect.
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { getRelatedPosts } = await import("../src/changelog/related");
if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;

function database(rows: Array<{ id: string; title: string; slug: string; roadmapStatus: string | null }>) {
  let condition: SQL | undefined;
  const limit = mock(async (count: number) => rows.slice(0, count));
  const query = {
    from() { return query; },
    innerJoin() { return query; },
    where(value: SQL) { condition = value; return query; },
    orderBy() { return query; },
    limit,
  };
  const select = mock(() => query);
  return { db: { select } as unknown as Parameters<typeof getRelatedPosts>[0], select, limit, condition: () => condition };
}
const row = (id: string) => ({ id, title: id, slug: id, roadmapStatus: "completed" });

test("batches links across entries without truncating at twenty, preserving saved order", async () => {
  const rows = Array.from({ length: 30 }, (_, i) => row(String(i)));
  const source = database(rows);
  const ids = rows.map((post) => post.id).reverse();
  const result = await getRelatedPosts(source.db, "workspace", { ids, publicOnly: true });
  expect(result.map((post) => post.id)).toEqual(ids);
  expect(source.limit).toHaveBeenCalledWith(30);
});

test("public links are constrained to the workspace and published visible public feedback", async () => {
  const source = database([row("visible")]);
  const result = await getRelatedPosts(source.db, "workspace", { ids: ["missing", "visible"], publicOnly: true });
  const query = new PgDialect().sqlToQuery(source.condition()!);
  expect(query.sql).toContain('"board"."workspace_id"');
  expect(query.sql).toContain('"post"."status"');
  expect(query.sql).toContain('"board"."is_public"');
  expect(query.sql).toContain('"board"."is_visible"');
  expect(query.sql).toContain('"board"."is_system"');
  expect(query.params).toEqual(["workspace", "published", true, true, false, "missing", "visible"]);
  expect(result.map((post) => post.id)).toEqual(["visible"]);
});

test("entries without links do not query posts", async () => {
  const source = database([]);
  expect(await getRelatedPosts(source.db, "workspace", { ids: [], publicOnly: true })).toEqual([]);
  expect(source.select).not.toHaveBeenCalled();
});
