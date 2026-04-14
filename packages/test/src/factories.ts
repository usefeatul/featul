import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index";

type TestDb = NodePgDatabase<typeof schema>;

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

export function resetFactoryState(): void {
  sequence = 0;
}

export const defaultMemberPermissions = {
  canManageWorkspace: false,
  canManageBilling: false,
  canManageMembers: false,
  canManageBoards: false,
  canModerateAllBoards: false,
  canConfigureBranding: false,
} as const;

export async function insertUser(
  db: TestDb,
  overrides: Partial<typeof schema.user.$inferInsert> = {},
) {
  const now = new Date();
  const [record] = await db
    .insert(schema.user)
    .values({
      id: nextId("user"),
      name: "Test User",
      email: `${nextId("member")}@example.com`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    })
    .returning();

  return record!;
}

export async function insertWorkspace(
  db: TestDb,
  overrides: Partial<typeof schema.workspace.$inferInsert> & {
    ownerId: string;
  },
) {
  const [record] = await db
    .insert(schema.workspace)
    .values({
      name: "Test Workspace",
      slug: nextId("workspace"),
      domain: `${nextId("workspace")}.featul.test`,
      plan: "free",
      timezone: "UTC",
      ...overrides,
    })
    .returning();

  return record!;
}

export async function insertWorkspaceMember(
  db: TestDb,
  overrides: Partial<typeof schema.workspaceMember.$inferInsert> & {
    workspaceId: string;
    userId: string;
  },
) {
  const now = new Date();
  const { workspaceId, userId, ...rest } = overrides;
  const [record] = await db
    .insert(schema.workspaceMember)
    .values({
      workspaceId,
      userId,
      role: "member",
      permissions: { ...defaultMemberPermissions },
      invitedAt: now,
      joinedAt: now,
      isActive: true,
      ...rest,
    })
    .returning();

  return record!;
}

export async function insertBoard(
  db: TestDb,
  overrides: Partial<typeof schema.board.$inferInsert> & {
    workspaceId: string;
    createdBy: string;
    name?: string;
    slug?: string;
  },
) {
  const { workspaceId, createdBy, name = "Feedback", slug = nextId("board"), ...rest } =
    overrides;
  const [record] = await db
    .insert(schema.board)
    .values({
      workspaceId,
      createdBy,
      name,
      slug,
      ...rest,
    })
    .returning();

  return record!;
}

export async function insertTag(
  db: TestDb,
  overrides: Partial<typeof schema.tag.$inferInsert> & {
    workspaceId: string;
    name?: string;
    slug?: string;
  },
) {
  const { workspaceId, name = "VIP", slug = nextId("tag"), ...rest } = overrides;
  const [record] = await db
    .insert(schema.tag)
    .values({
      workspaceId,
      name,
      slug,
      ...rest,
    })
    .returning();

  return record!;
}

export async function insertWorkspaceInvite(
  db: TestDb,
  overrides: Partial<typeof schema.workspaceInvite.$inferInsert> & {
    workspaceId: string;
    invitedBy: string;
  },
) {
  const { workspaceId, invitedBy, ...rest } = overrides;
  const [record] = await db
    .insert(schema.workspaceInvite)
    .values({
      workspaceId,
      invitedBy,
      email: `${nextId("invite")}@example.com`,
      role: "member",
      token: nextId("token"),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ...rest,
    })
    .returning();

  return record!;
}
