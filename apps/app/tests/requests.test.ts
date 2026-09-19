import { beforeEach, expect, mock, test } from "bun:test";

const session = mock(async (): Promise<any> => ({ user: { id: "user" } }));
const workspaces = mock(async () => [{ slug: "demo" }]);
const posts = mock(async (): Promise<any[]> => []);
const count = mock(async () => 25);
const filtered = mock(async (): Promise<any> => ({ rows: [{ id: "filtered" }], totalCount: 21 }));
mock.module("@featul/auth/session", () => ({ getServerSession: session }));
mock.module("@/lib/workspace", () => ({
  listUserWorkspaces: workspaces,
  getWorkspacePosts: posts,
  getWorkspacePostsCount: count,
}));
mock.module("@/app/workspaces/[slug]/requests/data", () => ({ loadRequestsPageData: filtered }));
const { loadMoreRequests } = await import("../src/lib/requests.actions");
const input = { slug: "demo", offset: 20, variant: "requests" as const, query: "" };

beforeEach(() => {
  session.mockClear();
  session.mockImplementation(async () => ({ user: { id: "user" } }));
  workspaces.mockClear();
  workspaces.mockImplementation(async () => [{ slug: "demo" }]);
  posts.mockClear();
  filtered.mockClear();
});

test("rejects signed-out users before loading private requests", async () => {
  session.mockImplementation(async () => null);
  await expect(loadMoreRequests(input)).rejects.toThrow("Sign in");
  expect(filtered).not.toHaveBeenCalled();
});

test("rejects users outside the workspace", async () => {
  workspaces.mockImplementation(async () => [{ slug: "different" }]);
  await expect(loadMoreRequests(input)).rejects.toThrow("access denied");
  expect(filtered).not.toHaveBeenCalled();
});

test("preserves every filter while advancing independently of the URL page", async () => {
  const query = new URLSearchParams({ status: '["planned"]', board: '["bugs"]', tag: '["ux"]', order: "likes", search: "editor", page: "1" }).toString();
  const result = await loadMoreRequests({ ...input, query });
  expect(filtered).toHaveBeenCalledWith({ slug: "demo", offset: 20, searchParams: {
    status: '["planned"]', board: '["bugs"]', tag: '["ux"]', order: "likes", search: "editor",
  } });
  expect(result).toEqual({ items: [{ id: "filtered" }], nextOffset: 21, hasMore: false });
});

test("empty batches stop loading even if the count changed", async () => {
  const result = await loadMoreRequests({ ...input, variant: "workspace" });
  expect(result.hasMore).toBe(false);
  expect(posts).toHaveBeenCalledWith("demo", {
    statuses: ["pending", "review", "planned", "progress"],
    order: "newest",
    limit: 50,
    offset: 20,
  });
});

test("validates offsets before querying", async () => {
  for (const offset of [-1, 1.5, Infinity]) {
    await expect(loadMoreRequests({ ...input, offset })).rejects.toThrow();
  }
  expect(session).not.toHaveBeenCalled();
});
