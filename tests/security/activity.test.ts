import "./setup";
import { expect, test } from "bun:test";
import { PgDialect } from "drizzle-orm/pg-core";
import type { db } from "@featul/db";
import { listPostActivity } from "../../packages/api/src/post/activity";
import { getPostActivityDetails } from "../../packages/api/src/activity/details";
import { describePostActivity } from "../../packages/api/src/activity/post";
import { postActivitySchema } from "../../packages/api/src/validators/post";

const target = {
  id: "p1",
  workspaceId: "w1",
  ownerId: "owner",
  status: "published",
  isPublic: true,
  isVisible: true,
  isActive: true,
  isSystem: false,
};
const event = {
  totalCount: 1,
  id: "a1",
  action: "post_meta_updated",
  createdAt: new Date("2026-10-01T10:00:00Z"),
  actorId: "owner",
  memberRole: null,
  name: "Private name",
  image: "https://example.com/avatar.png",
  metadata: {
    fromStatus: "planned",
    toStatus: "progress",
    snoozedUntil: "private date",
    reason: "private reason",
  },
};

function fixture(results: unknown[][]) {
  let queries = 0;
  const filters: ReturnType<PgDialect["sqlToQuery"]>[] = [];
  const offsets: number[] = [];
  const database = {
    select() {
      const rows = results[queries++];
      if (!rows) throw new Error("Unexpected query");
      const builder = {
        from: () => builder,
        innerJoin: () => builder,
        leftJoin: () => builder,
        where: (condition: Parameters<PgDialect["sqlToQuery"]>[0]) => {
          filters.push(new PgDialect().sqlToQuery(condition));
          return builder;
        },
        orderBy: () => builder,
        limit: () => builder,
        offset: (value: number) => {
          offsets.push(value);
          return builder;
        },
        then: (resolve: (value: unknown[]) => unknown) =>
          Promise.resolve(rows).then(resolve),
      };
      return builder;
    },
  };
  return {
    database: database as unknown as typeof db,
    filters,
    offsets,
    queries: () => queries,
  };
}

test("activity denies private posts and workspace feeds before reading logs", async () => {
  for (const [post, surface, status] of [
    [{ ...target, isPublic: false }, "public", 404],
    [{ ...target, status: "draft" }, "public", 404],
    [target, "workspace", 403],
  ] as const) {
    const f = fixture([[post]]);
    await expect(
      listPostActivity(f.database, { postId: "p1", surface, offset: 0 }, null),
    ).rejects.toMatchObject({ status });
    expect(f.queries()).toBe(1);
  }
});

test("public activity hides identity and metadata even for the signed-in owner", async () => {
  const f = fixture([[target], [{ hideIdentity: true }], [event]]);
  const result = await listPostActivity(
    f.database,
    { postId: "p1", surface: "public", offset: 0 },
    "owner",
  );
  expect(result.items[0]?.actor).toEqual({
    name: "Member",
    image: null,
    role: null,
    isOwner: false,
  });
  expect(result.items[0]?.description).toBe(
    "changed status from planned to progress",
  );
  expect(JSON.stringify(result)).not.toMatch(/private|Private|metadata|avatar/);
  const params = f.filters.at(-1)!.params;
  expect(params).toContain("w1");
  expect(params).toContain("p1");
  expect(params).toContain("post");
  expect(params).not.toContain("post_reported");
  expect(params).not.toContain("comment_created");
});

test("workspace history paginates and includes internal property descriptions", async () => {
  const f = fixture([
    [target],
    [{ hideIdentity: true }],
    Array.from({ length: 31 }, (_, index) => ({
      ...event,
      id: `a${index}`,
      totalCount: 61,
    })),
  ]);
  const result = await listPostActivity(
    f.database,
    { postId: "p1", surface: "workspace", offset: 30 },
    "owner",
  );
  expect(result.items).toHaveLength(30);
  expect(result.nextOffset).toBe(60);
  expect(result.totalCount).toBe(61);
  expect(f.offsets).toEqual([30]);
  expect(result.items[0]?.actor.name).toBe("Private name");
  expect(result.items[0]?.actor.isOwner).toBe(true);
  expect(result.items[0]?.description).toContain("snoozed this post");
});

test("activity handles legacy metadata and rejects invalid pagination", () => {
  expect(describePostActivity("post_updated", null, false)).toBe(
    "updated this post",
  );
  expect(
    describePostActivity(
      "post_updated",
      { fromStatus: "planned", toStatus: "planned", hasTitleChange: true },
      true,
    ),
  ).toBe("updated the title");
  for (const offset of [-1, 1.5, "nope", 100001]) {
    expect(postActivitySchema.safeParse({ postId: "p1", offset }).success).toBe(
      false,
    );
  }
});

test("workspace activity projects before/after edits and tag changes without raw metadata", () => {
  const details = getPostActivityDetails(
    "post_updated",
    {
      previousTitle: "Old title",
      nextTitle: "New title",
      previousContent: "Original paragraph",
      nextContent: "",
      addedTags: [{ id: "secret-id", name: "Design", color: "#aabbcc" }],
      removedTags: [{ name: "Bug", color: "url(secret)" }, null, { name: 123 }],
      fromBoardName: "Ideas",
      toBoardName: "Features",
      reason: "secret reason",
    },
    true,
  );
  expect(details.changes).toEqual([
    { kind: "title", before: "Old title", after: "New title" },
    { kind: "content", before: "Original paragraph", after: "" },
    { kind: "board", before: "Ideas", after: "Features" },
    {
      kind: "tags",
      added: [{ name: "Design", color: "#aabbcc" }],
      removed: [{ name: "Bug", color: null }],
    },
  ]);
  expect(JSON.stringify(details)).not.toContain("secret");
});

test("public activity never exposes historical text, board names, tags, merge titles or private flags", () => {
  const metadata = {
    fromStatus: "review",
    toStatus: "progress",
    previousContent: "secret",
    nextContent: "also secret",
    previousTitle: "secret",
    nextTitle: "private",
    fromBoardName: "private",
    toBoardName: "public",
    sourcePostTitle: "secret",
    addedTags: [{ name: "secret" }],
    isLocked: true,
    snoozedUntil: null,
  };
  const details = getPostActivityDetails("post_updated", metadata, false);
  expect(details).toEqual({
    kind: "status",
    changes: [{ kind: "status", before: "review", after: "progress" }],
  });
  expect(
    getPostActivityDetails("post_merged", metadata, false).changes,
  ).toHaveLength(1);
});

test("legacy and malformed activity metadata never invents old content", () => {
  expect(
    getPostActivityDetails("post_updated", { hasContentChange: true }, true),
  ).toEqual({ kind: "content", changes: [] });
  expect(
    getPostActivityDetails(
      "post_updated",
      { previousContent: 42, nextContent: "new", addedTags: [null] },
      true,
    ).changes,
  ).toEqual([]);
  expect(
    getPostActivityDetails("post_meta_updated", { isLocked: false }, true),
  ).toEqual({ kind: "locked", changes: [{ kind: "locked", enabled: false }] });
});
