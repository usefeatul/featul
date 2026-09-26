import { beforeEach, expect, mock, test } from "bun:test";
import * as schema from "../../../../packages/db/schema";

let started: string[];
let release: () => void;
let gate: Promise<void>;
let workspaceExists = true;
let postExists = true;
let title = "Saved title";
let authorId: string | null = "member";
const read = async <T>(name: string, value: T): Promise<T> => {
  started.push(name);
  await gate;
  return value;
};
mock.module("@featul/db", () => ({
  ...schema,
  db: {
    select: () => {
      let table: unknown;
      const query = {
        from(value: unknown) { table = value; return query; },
        innerJoin() { return query; },
        leftJoin() { return query; },
        where() { return query; },
        limit() { return query; },
        then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
          const result = table === schema.post
            ? Promise.resolve(postExists ? [{ id: "post", title, authorId, createdAt: new Date(0), publishedAt: null, metadata: null }] : [])
            : table === schema.workspaceMember
              ? read("role", [{ role: "viewer" }])
              : table === schema.postTag
                ? read("tags", [{ id: "tag", name: "Bug" }])
                : read("reports", [{ count: 2 }]);
          return result.then(resolve, reject);
        },
      };
      return query;
    },
  },
}));
mock.module("@/lib/request/detail", () => ({
  loadWorkspaceBySlug: async () => workspaceExists ? { id: "ws", ownerId: "owner" } : null,
  buildPostSelect: () => ({}),
  ensureAuthorAvatar: (post: unknown) => post,
  loadMergedPostData: async () => ({ mergedCount: 0, mergedInto: null, mergedSources: [] }),
  loadPostComments: () => read("comments", { initialComments: [{ id: "comment" }], initialCollapsedIds: ["comment"] }),
}));
const navigation = mock(() => read("navigation", { prev: { slug: "previous", title: "Previous" }, next: null }));
mock.module("@/lib/workspace", () => ({ getPostNavigation: navigation, normalizeStatus: (s: string) => s }));
mock.module("@/lib/vote.server", () => ({ readHasVotedForPost: () => read("vote", true) }));
const { loadRequestDetailPageData } = await import("../../src/app/workspaces/[slug]/requests/[post]/data");
const input = { workspaceSlug: "demo", postSlug: "post", searchParams: { search: "editor", order: "likes" } };

beforeEach(() => {
  started = [];
  gate = new Promise<void>((resolve) => { release = resolve; });
  workspaceExists = postExists = true;
  authorId = "member";
  title = "Saved title";
  navigation.mockClear();
});

test("starts independent reads together and preserves complete detail data", async () => {
  const pending = loadRequestDetailPageData(input);
  try {
    // Allow the workspace/post prerequisites to resolve, keeping all detail reads blocked.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(started.sort()).toEqual(["comments", "navigation", "role", "tags", "vote"]);
  } finally { release(); }
  const data = await pending;
  expect(data?.post).toMatchObject({ title: "Saved title", role: "viewer", isOwner: false, hasVoted: true, tags: [{ id: "tag", name: "Bug" }], reportCount: 0 });
  expect(data?.initialComments).toEqual([{ id: "comment" }]);
  expect(data?.initialCollapsedIds).toEqual(["comment"]);
  expect(data?.navigation).toEqual({ prev: { slug: "previous", title: "Previous" }, next: null });
  expect(navigation.mock.calls[0]).toEqual(["demo", "post", expect.objectContaining({ search: "editor", order: "likes" })]);
});

test("a new load reads fresh data and preserves owner report counts", async () => {
  release();
  authorId = "owner";
  const first = await loadRequestDetailPageData(input);
  expect(first?.post).toMatchObject({ isOwner: true, role: "admin", reportCount: 2 });
  title = "Updated saved title";
  const second = await loadRequestDetailPageData(input);
  expect(second?.post.title).toBe("Updated saved title");
});

test("missing workspace or post stops dependent reads", async () => {
  workspaceExists = false;
  expect(await loadRequestDetailPageData(input)).toBeNull();
  workspaceExists = true;
  postExists = false;
  expect(await loadRequestDetailPageData(input)).toBeNull();
  expect(started).toEqual([]);
});
