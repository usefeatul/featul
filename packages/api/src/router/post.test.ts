import { createClient } from "jstack";
import { and, eq } from "drizzle-orm";
import SuperJSON from "superjson";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as dbSchema from "@featul/db";
import {
  closeTestDatabase,
  createTestDatabase,
  migrateTestDatabase,
  resetTestDatabase,
  resetFactoryState,
  type TestDatabase,
} from "@featul/test";
import {
  insertBoard,
  insertTag,
  insertUser,
  insertWorkspace,
  insertWorkspaceMember,
} from "@featul/test/factories";

type ApiClient = (typeof import("../client"))["client"];

const sentWebhooks: Array<{ workspaceId: string; slug: string }> = [];

let testDatabase: TestDatabase;

const authModule = {
  auth: {
    api: {
      getSession: vi.fn(async ({ headers }: { headers?: HeadersInit }) => {
        const requestHeaders = new Headers(headers);
        const userId = requestHeaders.get("x-user-id");

        if (!userId) return null;

        return {
          user: {
            id: userId,
            name: `User ${userId}`,
            email: `${userId}@example.com`,
          },
        };
      }),
    },
  },
};

vi.mock("@featul/db", async () => {
  const actual = await vi.importActual<typeof import("@featul/db")>("@featul/db");

  return {
    ...actual,
    get db() {
      return testDatabase.db;
    },
  };
});

vi.mock("@featul/auth", () => authModule);
vi.mock("@featul/auth/auth", () => authModule);

vi.mock("../services/webhook", () => ({
  triggerPostWebhooks: vi.fn((_db: unknown, workspaceId: string, payload: { slug: string }) => {
    sentWebhooks.push({ workspaceId, slug: payload.slug });
  }),
}));

vi.mock("../services/ratelimiter", () => ({
  applyRateLimitHeaders: () => {},
  limitPublic: async () => ({
    enabled: false,
    success: true,
    remaining: Number.MAX_SAFE_INTEGER,
    reset: Date.now(),
    limit: Number.MAX_SAFE_INTEGER,
  }),
  limitPrivate: async () => ({
    enabled: false,
    success: true,
    remaining: Number.MAX_SAFE_INTEGER,
    reset: Date.now(),
    limit: Number.MAX_SAFE_INTEGER,
  }),
  limitInvite: async () => ({
    enabled: false,
    success: true,
    remaining: Number.MAX_SAFE_INTEGER,
    reset: Date.now(),
    limit: Number.MAX_SAFE_INTEGER,
  }),
}));

vi.mock("../shared/request-origin", () => ({
  enforceTrustedBrowserOrigin: () => {},
}));

describe("post router integration", () => {
  let client: ApiClient;

  async function parsePayload<T>(response: Response): Promise<T> {
    const text = await response.text();

    if (response.headers.get("x-is-superjson") === "true") {
      return SuperJSON.parse<T>(text);
    }

    return JSON.parse(text) as T;
  }

  beforeAll(async () => {
    testDatabase = createTestDatabase();
    await migrateTestDatabase(testDatabase);

    const { app } = await import("../elysia");

    client = createClient({
      baseUrl: "http://localhost:3000/api",
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        app.handle(new Request(input, init)),
    }) as unknown as ApiClient;
  });

  beforeEach(async () => {
    sentWebhooks.length = 0;
    resetFactoryState();
    await resetTestDatabase(testDatabase);
  });

  afterAll(async () => {
    await closeTestDatabase(testDatabase);
  });

  it("creates an anonymous post on a public board and writes related records", async () => {
    const owner = await insertUser(testDatabase.db, {
      email: "owner@example.com",
      name: "Owner",
    });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "postpublic",
    });
    const board = await insertBoard(testDatabase.db, {
      workspaceId: workspace.id,
      createdBy: owner.id,
      slug: "feedback",
      allowAnonymous: true,
      isPublic: true,
    });
    const tag = await insertTag(testDatabase.db, {
      workspaceId: workspace.id,
      name: "VIP",
      slug: "vip",
    });

    const response = await client.post.create.$post({
      title: "Need bulk export",
      content: "We need CSV export for billing and customer data.",
      workspaceSlug: workspace.slug,
      boardSlug: board.slug,
      fingerprint: "anon-fingerprint",
      roadmapStatus: "pending",
      tags: [tag.id],
    });

    expect(response.ok).toBe(true);

    const payload = await parsePayload<{ post: typeof dbSchema.post.$inferSelect }>(
      response,
    );
    expect(payload.post.title).toBe("Need bulk export");
    expect(payload.post.authorId).toBeNull();
    expect(payload.post.isAnonymous).toBe(true);
    expect(payload.post.slug).toMatch(/^need-bulk-export-/);

    const [storedPost] = await testDatabase.db
      .select()
      .from(dbSchema.post)
      .where(eq(dbSchema.post.id, payload.post.id))
      .limit(1);
    const [storedVote] = await testDatabase.db
      .select()
      .from(dbSchema.vote)
      .where(eq(dbSchema.vote.postId, payload.post.id))
      .limit(1);
    const [storedPostTag] = await testDatabase.db
      .select()
      .from(dbSchema.postTag)
      .where(
        and(
          eq(dbSchema.postTag.postId, payload.post.id),
          eq(dbSchema.postTag.tagId, tag.id),
        ),
      )
      .limit(1);
    const [activity] = await testDatabase.db
      .select()
      .from(dbSchema.activityLog)
      .where(eq(dbSchema.activityLog.entityId, payload.post.id))
      .limit(1);

    expect(storedPost?.upvotes).toBe(1);
    expect(storedPost?.metadata).toMatchObject({ fingerprint: "anon-fingerprint" });
    expect(storedVote?.fingerprint).toBe("anon-fingerprint");
    expect(storedVote?.userId).toBeNull();
    expect(storedPostTag?.tagId).toBe(tag.id);
    expect(activity).toMatchObject({
      workspaceId: workspace.id,
      action: "post_created",
      actionType: "create",
      entity: "post",
    });
    expect(sentWebhooks).toEqual([
      expect.objectContaining({
        workspaceId: workspace.id,
        slug: payload.post.slug,
      }),
    ]);
  });

  it("creates a signed-in post on a private board for a workspace member", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const member = await insertUser(testDatabase.db, { email: "member@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "privateposts",
    });
    const board = await insertBoard(testDatabase.db, {
      workspaceId: workspace.id,
      createdBy: owner.id,
      slug: "internal",
      isPublic: false,
      allowAnonymous: false,
    });

    await insertWorkspaceMember(testDatabase.db, {
      workspaceId: workspace.id,
      userId: member.id,
      role: "member",
    });

    const response = await client.post.create.$post(
      {
        title: "Internal roadmap request",
        content: "Please add private roadmap labels.",
        workspaceSlug: workspace.slug,
        boardSlug: board.slug,
      },
      {
        headers: {
          "x-user-id": member.id,
        },
      },
    );

    expect(response.ok).toBe(true);
    const payload = await parsePayload<{ post: typeof dbSchema.post.$inferSelect }>(
      response,
    );
    expect(payload.post.authorId).toBe(member.id);
    expect(payload.post.isAnonymous).toBe(false);
  });

  it("creates an anonymous post on a public board without a provided fingerprint", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "fingerprintcheck",
    });
    const board = await insertBoard(testDatabase.db, {
      workspaceId: workspace.id,
      createdBy: owner.id,
      slug: "feedback",
      allowAnonymous: true,
      isPublic: true,
    });

    const response = await client.post.create.$post({
      title: "Anon request",
      content: "Need another export option.",
      workspaceSlug: workspace.slug,
      boardSlug: board.slug,
    });

    expect(response.ok).toBe(true);

    const payload = await parsePayload<{ post: typeof dbSchema.post.$inferSelect }>(
      response,
    );
    const [storedPost] = await testDatabase.db
      .select()
      .from(dbSchema.post)
      .where(eq(dbSchema.post.id, payload.post.id))
      .limit(1);

    expect(storedPost?.metadata).toEqual(
      expect.objectContaining({
        fingerprint: expect.any(String),
      }),
    );
    expect(
      (storedPost?.metadata as { fingerprint?: string } | null)?.fingerprint?.length,
    ).toBeGreaterThan(0);
  });

  it("rejects anonymous post creation on a private board", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "privateguard",
    });
    const board = await insertBoard(testDatabase.db, {
      workspaceId: workspace.id,
      createdBy: owner.id,
      slug: "internal",
      isPublic: false,
      allowAnonymous: false,
    });

    const response = await client.post.create.$post({
      title: "Blocked post",
      content: "This should not be accepted anonymously.",
      workspaceSlug: workspace.slug,
      boardSlug: board.slug,
      fingerprint: "anon-fingerprint",
    });

    expect(response.status).toBe(401);
    expect(await response.text()).toContain("Please sign in");
  });

  it("rejects signed-in post creation on a private board for a non-member", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const outsider = await insertUser(testDatabase.db, { email: "outsider@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "memberguard",
    });
    const board = await insertBoard(testDatabase.db, {
      workspaceId: workspace.id,
      createdBy: owner.id,
      slug: "internal",
      isPublic: false,
      allowAnonymous: false,
    });

    const response = await client.post.create.$post(
      {
        title: "Outsider post",
        content: "I should not be able to post here.",
        workspaceSlug: workspace.slug,
        boardSlug: board.slug,
      },
      {
        headers: {
          "x-user-id": outsider.id,
        },
      },
    );

    expect(response.status).toBe(403);
    expect(await response.text()).toContain("Only workspace members");
  });
});
