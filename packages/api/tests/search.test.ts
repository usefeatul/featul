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
  test("ranks matching names above popular content-only matches", async () => {
    const { db } = await import("@featul/db");
    const { buildPostFtsFilter, buildPostSearchRelevance } = await import("../src/post/search");
    const rows = await db.execute(sql`
      with post(title, content, upvotes) as (
        values
          ('Unrelated popular request', 'Duplicate of comments', 1000),
          ('Fix duplicate of comments', '', 100),
          ('Duplicate of comments in the inbox', '', 50),
          ('Duplicate of comments', '', 0)
      )
      select title from post where ${buildPostFtsFilter("duplicate of comments")}
      order by ${buildPostSearchRelevance("duplicate of comments")} desc, upvotes desc
    `);
    expect(rows.rows.map((row) => row.title)).toEqual([
      "Duplicate of comments",
      "Duplicate of comments in the inbox",
      "Fix duplicate of comments",
      "Unrelated popular request",
    ]);
  });

  test("three-character title prefixes outrank body matches", async () => {
    const { db } = await import("@featul/db");
    const { buildPostFtsFilter, buildPostSearchRelevance } = await import("../src/post/search");
    const rows = await db.execute(sql`
      with post(title, content, upvotes) as (
        values
          ('Popular request', 'Duplicate of comments', 1000),
          ('Duplicate of comments', '', 0)
      )
      select title from post where ${buildPostFtsFilter("dup")}
      order by ${buildPostSearchRelevance("dup")} desc, upvotes desc
    `);
    expect(rows.rows.map((row) => row.title)).toEqual([
      "Duplicate of comments", "Popular request",
    ]);
  });

});
