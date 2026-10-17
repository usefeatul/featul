import "./setup";
import { expect, test } from "bun:test";
import { PgDialect } from "drizzle-orm/pg-core";
import type { db } from "@featul/db";
import {
  listCommentReactions,
  setCommentReaction,
} from "../../packages/api/src/post/reactions";
import { reactCommentInputSchema } from "../../packages/api/src/validators/comment";

const post = {
  id: "p1",
  workspaceId: "w1",
  ownerId: "owner",
  status: "published",
  isPublic: true,
  isVisible: true,
  isActive: true,
  isSystem: false,
  isLocked: false,
  allowComments: true,
};
const comment = {
  id: "c1",
  postId: "p1",
  status: "published",
  isInternal: false,
};
const actor = { userId: "owner", fingerprint: null };
const input = { commentId: "c1", emoji: "👍", active: true };

function fixture(results: unknown[][]) {
  let queries = 0;
  const writes: unknown[] = [];
  const filters: ReturnType<PgDialect["sqlToQuery"]>[] = [];
  const database = {
    select() {
      const rows = results[queries++];
      if (!rows) throw new Error("Unexpected query");
      const builder = {
        from: () => builder,
        innerJoin: () => builder,
        where: (condition: Parameters<PgDialect["sqlToQuery"]>[0]) => {
          filters.push(new PgDialect().sqlToQuery(condition));
          return builder;
        },
        groupBy: () => builder,
        orderBy: () => builder,
        limit: () => builder,
        then: (resolve: (rows: unknown[]) => unknown) =>
          Promise.resolve(rows).then(resolve),
      };
      return builder;
    },
    insert: () => ({
      values: (value: unknown) => ({
        onConflictDoNothing: async () => {
          writes.push(value);
        },
      }),
    }),
    delete: () => ({
      where: async (condition: Parameters<PgDialect["sqlToQuery"]>[0]) => {
        writes.push(new PgDialect().sqlToQuery(condition));
      },
    }),
  };
  return {
    database: database as unknown as typeof db,
    writes,
    filters,
    queries: () => queries,
  };
}

test("reactions accept only thumbs-up and a boolean desired state", () => {
  expect(reactCommentInputSchema.safeParse(input).success).toBe(true);
  for (const emoji of [
    "",
    "hello",
    "👍👍",
    "❤️",
    "👍🏽",
    "👍\n",
    " 👍",
    "<script>",
    "a".repeat(65),
  ]) {
    expect(reactCommentInputSchema.safeParse({ ...input, emoji }).success).toBe(
      false,
    );
  }
  expect(
    reactCommentInputSchema.safeParse({ ...input, active: "true" }).success,
  ).toBe(false);
});

test("reactions deny hidden/internal comments, private posts, locks and disabled comments before writing", async () => {
  for (const [targetComment, targetPost, status] of [
    [{ ...comment, isInternal: true }, post, 404],
    [{ ...comment, status: "hidden" }, post, 404],
    [comment, { ...post, isPublic: false }, 404],
    [comment, { ...post, status: "draft" }, 404],
    [comment, { ...post, isLocked: true }, 403],
    [comment, { ...post, allowComments: false }, 403],
  ] as const) {
    const f = fixture([[targetComment], [targetPost]]);
    await expect(
      setCommentReaction(f.database, input, {
        userId: null,
        fingerprint: "visitor",
      }),
    ).rejects.toMatchObject({ status });
    expect(f.writes).toHaveLength(0);
  }
});

test("reactions persist the signed-in identity and return only counts and viewer state", async () => {
  const f = fixture([
    [comment],
    [post],
    [{ commentId: "c1", emoji: "👍", count: 2, reacted: true }],
  ]);
  expect(
    await setCommentReaction(f.database, input, {
      ...actor,
      fingerprint: "ignored",
    }),
  ).toEqual({
    reactions: [{ emoji: "👍", count: 2, reacted: true }],
  });
  expect(f.writes).toEqual([
    { commentId: "c1", emoji: "👍", userId: "owner", fingerprint: null },
  ]);
  expect(f.filters.at(-1)?.params).toEqual(["c1"]);
});

test("removing reactions targets only this comment, emoji and actor", async () => {
  for (const identity of [actor, { userId: null, fingerprint: "visitor" }]) {
    const f = fixture([[comment], [post], []]);
    expect(
      await setCommentReaction(
        f.database,
        { ...input, active: false },
        identity,
      ),
    ).toEqual({ reactions: [] });
    expect(f.writes).toHaveLength(1);
    const query = f.writes[0] as { params: unknown[]; sql: string };
    expect(query.params).toEqual([
      "c1",
      "👍",
      identity.userId || identity.fingerprint,
    ]);
    if (!identity.userId) expect(query.sql).toContain('"user_id" is null');
  }
});

test("empty visible comment sets do not query reactions", async () => {
  const f = fixture([]);
  expect(await listCommentReactions(f.database, [], actor)).toEqual(new Map());
  expect(f.queries()).toBe(0);
});
