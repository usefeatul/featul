import { createClient } from "jstack";
import { eq } from "drizzle-orm";
import SuperJSON from "superjson";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeTestDatabase,
  createTestDatabase,
  migrateTestDatabase,
  resetTestDatabase,
  resetFactoryState,
  type TestDatabase,
} from "@featul/test";
import {
  insertUser,
  insertWorkspace,
  insertWorkspaceInvite,
  insertWorkspaceMember,
  defaultMemberPermissions,
} from "@featul/test/factories";

type ApiClient = (typeof import("../client"))["client"];

const sentInvites: Array<{ to: string; inviteUrl: string }> = [];

let currentUserId: string | null = null;
let testDatabase: TestDatabase;

vi.mock("@featul/db", async () => {
  const actual = await vi.importActual<typeof import("@featul/db")>("@featul/db");

  return {
    ...actual,
    get db() {
      return testDatabase.db;
    },
  };
});

vi.mock("@featul/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async ({ headers }: { headers?: HeadersInit }) => {
        const requestHeaders = new Headers(headers);
        const userId = requestHeaders.get("x-user-id") || currentUserId;

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
}));

vi.mock("@featul/auth/email", () => ({
  sendWorkspaceInvite: vi.fn(async (to: string, _name: string, inviteUrl: string) => {
    sentInvites.push({ to, inviteUrl });
  }),
}));

vi.mock("@featul/auth/billing", async () => {
  const actual = await vi.importActual<typeof import("@featul/db")>("@featul/db");

  return {
    getEffectiveWorkspacePlan: async (workspaceId: string) => {
      const [record] = await testDatabase.db
        .select({ plan: actual.workspace.plan })
        .from(actual.workspace)
        .where(eq(actual.workspace.id, workspaceId))
        .limit(1);

      return (record?.plan ?? "free") as "free" | "starter" | "professional";
    },
  };
});

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

describe("team router integration", () => {
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
    currentUserId = null;
    sentInvites.length = 0;
    resetFactoryState();
    await resetTestDatabase(testDatabase);
  });

  afterAll(async () => {
    await closeTestDatabase(testDatabase);
  });

  it("returns the owner as the viewer for a workspace", async () => {
    const owner = await insertUser(testDatabase.db, {
      email: "owner@example.com",
      name: "Owner",
    });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "ownerworkspace",
    });

    const response = await client.team.viewerByWorkspaceSlug.$get(
      { slug: workspace.slug },
      {
        headers: {
          "x-user-id": owner.id,
        },
      },
    );

    expect(await parsePayload(response)).toEqual({
      role: "admin",
      isOwner: true,
    });
  });

  it("filters invites for emails that already belong to active members", async () => {
    const owner = await insertUser(testDatabase.db, {
      email: "owner@example.com",
      name: "Owner",
    });
    const member = await insertUser(testDatabase.db, {
      email: "member@example.com",
      name: "Member",
    });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "filterworkspace",
    });

    await insertWorkspaceMember(testDatabase.db, {
      workspaceId: workspace.id,
      userId: member.id,
      role: "member",
    });
    await insertWorkspaceInvite(testDatabase.db, {
      workspaceId: workspace.id,
      invitedBy: owner.id,
      email: member.email,
      token: "existing-member-token",
    });
    const visibleInvite = await insertWorkspaceInvite(testDatabase.db, {
      workspaceId: workspace.id,
      invitedBy: owner.id,
      email: "fresh@example.com",
      token: "fresh-token",
    });

    const response = await client.team.membersByWorkspaceSlug.$get(
      { slug: workspace.slug },
      {
        headers: {
          "x-user-id": owner.id,
        },
      },
    );
    const payload = await parsePayload<{ members: unknown[]; invites: unknown[]; meId: string } | { members: unknown[]; invites: unknown[] }>(response);
    if (!("meId" in payload)) {
      throw new Error("Expected members payload for an authorized viewer");
    }

    expect(payload.meId).toBe(owner.id);
    expect(payload.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: owner.id, isOwner: true }),
        expect.objectContaining({ userId: member.id, isOwner: false }),
      ]),
    );
    expect(payload.invites).toEqual([
      expect.objectContaining({ id: visibleInvite.id, email: "fresh@example.com" }),
    ]);
  });

  it("rejects invite creation when the viewer cannot manage members", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const member = await insertUser(testDatabase.db, { email: "member@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "permissionsworkspace",
    });

    await insertWorkspaceMember(testDatabase.db, {
      workspaceId: workspace.id,
      userId: member.id,
      role: "member",
      permissions: { ...defaultMemberPermissions },
    });

    const response = await client.team.invite.$post(
      {
        slug: workspace.slug,
        email: "newperson@example.com",
        role: "member",
      },
      {
        headers: {
          "x-user-id": member.id,
        },
      },
    );

    expect(response.status).toBe(403);
  });

  it("enforces member limits for free plans", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "limitworkspace",
      plan: "free",
    });

    for (const email of ["a@example.com", "b@example.com", "c@example.com"]) {
      const member = await insertUser(testDatabase.db, { email });
      await insertWorkspaceMember(testDatabase.db, {
        workspaceId: workspace.id,
        userId: member.id,
      });
    }

    const response = await client.team.invite.$post(
      {
        slug: workspace.slug,
        email: "overflow@example.com",
        role: "member",
      },
      {
        headers: {
          "x-user-id": owner.id,
        },
      },
    );

    expect(response.status).toBe(403);
  });

  it("creates invites for authorized managers and persists them to the database", async () => {
    const owner = await insertUser(testDatabase.db, { email: "owner@example.com" });
    const workspace = await insertWorkspace(testDatabase.db, {
      ownerId: owner.id,
      slug: "inviteworkspace",
      plan: "starter",
    });

    const response = await client.team.invite.$post(
      {
        slug: workspace.slug,
        email: "invitee@example.com",
        role: "member",
      },
      {
        headers: {
          "x-user-id": owner.id,
        },
      },
    );
    expect(response.ok).toBe(true);
    const payload = await parsePayload<{ ok: boolean; token: string }>(response);

    expect(payload.ok).toBe(true);
    expect(payload.token).toEqual(expect.any(String));
    expect(sentInvites).toEqual([
      expect.objectContaining({
        to: "invitee@example.com",
        inviteUrl: expect.stringContaining(payload.token),
      }),
    ]);
  });
});
