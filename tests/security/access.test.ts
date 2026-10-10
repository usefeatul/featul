import { expect, mock, test } from "bun:test";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:55439/security";
process.env.API_RATE_LIMIT_ENABLED = "false";
process.env.AUTH_RATE_LIMIT_ENABLED = "false";
const procedure = {
  input: () => procedure,
  get: (fn: unknown) => fn,
  post: (fn: unknown) => fn,
};
mock.module("../../packages/api/src/jstack.ts", () => ({
  j: { router: (routes: unknown) => routes },
  privateProcedure: procedure,
  publicProcedure: procedure,
}));
mock.module("../../packages/auth/src/auth.ts", () => ({
  auth: { api: { getSession: async () => null } },
}));
const { createBoardRouter } =
  await import("../../packages/api/src/router/board");
const { requirePostAccess, requireCommentAccess } =
  await import("../../packages/api/src/post/access");
const { createCommentRouter } =
  await import("../../packages/api/src/router/comment");

function fixture(rows: unknown[][]) {
  let queries = 0;
  const database = {
    select() {
      const result = rows[queries++];
      if (!result) throw new Error("Unexpected query after access denial");
      const builder: any = {
        from: () => builder,
        innerJoin: () => builder,
        leftJoin: () => builder,
        where: () => builder,
        limit: () => Promise.resolve(result),
        then: (resolve: any, reject: any) =>
          Promise.resolve(result).then(resolve, reject),
      };
      return builder;
    },
    update() {
      throw new Error("Unauthorized mutation attempted");
    },
    delete() {
      throw new Error("Unauthorized deletion attempted");
    },
  };
  return { database: database as any, queries: () => queries };
}
const target = {
  id: "p1",
  status: "published",
  workspaceId: "w1",
  ownerId: "owner",
  isPublic: true,
  isVisible: true,
  isActive: true,
  isSystem: false,
  isLocked: false,
};
const c = { superjson: (v: unknown) => v, header() {} };

test("legacy detail and board routes deny signed-in outsiders before reading content", async () => {
  const routes = createBoardRouter() as any;
  const detail = fixture([
    [
      {
        postId: "p1",
        workspaceId: "w1",
        workspaceOwnerId: "owner",
        boardIsPublic: true,
      },
    ],
    [],
  ]);
  await expect(
    routes.postDetail({
      ctx: { db: detail.database, session: { user: { id: "outsider" } } },
      input: { postId: "p1" },
      c,
    }),
  ).rejects.toMatchObject({ status: 403 });
  expect(detail.queries()).toBe(2);
  const board = fixture([
    [{ id: "w1", ownerId: "owner" }],
    [{ id: "b1", isPublic: true }],
    [],
  ]);
  await expect(
    routes.postsByBoard({
      ctx: { db: board.database, session: { user: { id: "outsider" } } },
      input: { slug: "test", boardSlug: "ideas" },
      c,
    }),
  ).rejects.toMatchObject({ status: 403 });
});

test("published public posts work, drafts require active membership", async () => {
  expect(
    (await requirePostAccess(fixture([[target]]).database, "p1", null)).member,
  ).toBe(false);
  await expect(
    requirePostAccess(
      fixture([[{ ...target, status: "pending" }], []]).database,
      "p1",
      "outsider",
      { allowUnpublishedForMembers: true },
    ),
  ).rejects.toMatchObject({ status: 404 });
  expect(
    (
      await requirePostAccess(
        fixture([[{ ...target, status: "pending" }]]).database,
        "p1",
        "owner",
        { allowUnpublishedForMembers: true },
      )
    ).member,
  ).toBe(true);
});

test.each([
  { isPublic: false },
  { isVisible: false },
  { isActive: false },
  { isSystem: true },
])("denies inaccessible board state %j", async (flags) => {
  await expect(
    requirePostAccess(
      fixture([[{ ...target, ...flags }], []]).database,
      "p1",
      "revoked",
    ),
  ).rejects.toMatchObject({ status: 404 });
});

test("internal comments remain unavailable to nonmembers on public posts", async () => {
  const f = fixture([
    [{ id: "c1", postId: "p1", status: "published", isInternal: true }],
    [target],
    [],
  ]);
  await expect(
    requireCommentAccess(f.database, "c1", "outsider"),
  ).rejects.toMatchObject({ status: 404 });
});

test.each(["update", "delete"])(
  "revoked private-comment authors cannot %s",
  async (action) => {
    const f = fixture([
      [{ id: "c1", postId: "p1", status: "published", isInternal: false }],
      [{ ...target, isPublic: false }],
      [],
    ]);
    const router = createCommentRouter() as any;
    await expect(
      router[action]({
        ctx: { db: f.database, session: { user: { id: "revoked" } } },
        input: { commentId: "c1", content: "changed" },
        c,
      }),
    ).rejects.toMatchObject({ status: 404 });
  },
);

test("locked posts reject comment edits before any write", async () => {
  const f = fixture([
    [{ id: "c1", postId: "p1", status: "published", isInternal: false }],
    [{ ...target, isLocked: true }],
  ]);
  await expect(
    (createCommentRouter() as any).update({
      ctx: { db: f.database, session: { user: { id: "owner" } } },
      input: { commentId: "c1", content: "changed" },
      c,
    }),
  ).rejects.toMatchObject({ status: 403 });
});

const { createPostRouter } = await import("../../packages/api/src/router/post");
test.each(["update", "delete"])("revoked private-post authors cannot %s", async action => {
  const f = fixture([[{ ...target, isPublic: false }], []]);
  await expect((createPostRouter() as any)[action]({ ctx: { db: f.database, session: { user: { id: "revoked" } } }, input: { postId: "p1", title: "changed", content: "changed" }, c })).rejects.toMatchObject({ status: 404 });
});
