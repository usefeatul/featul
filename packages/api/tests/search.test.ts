import { describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";

// Read-only PostgreSQL fixtures: no requests are created or modified.
describe.skipIf(!process.env.DATABASE_URL)("request search prefixes", () => {
  test.each([
    ["du", true],
    ["dupli", true],
    ["duplicate", true],
    ["DUPLI", true],
    ["  dupli  ", true],
    ["duplicate of com", true],
    ["du com", true],
    ["comment", true],
    ["report", true],
    ["unrelated", false],
    ["du missing", false],
    ["' | !", false],
  ])("%s matches correctly", async (query, expected) => {
    const { db } = await import("@featul/db");
    const { buildPostFtsFilter } = await import("../src/post/search");
    const rows = await db.execute(sql`
      with post(title, content) as (
        values ('Duplicate of comments', 'People reported repeated replies')
      )
      select exists(select 1 from post where ${buildPostFtsFilter(query)}) as matched
    `);
    expect(rows.rows[0]?.matched).toBe(expected);
  });
});
