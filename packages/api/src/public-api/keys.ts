import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { workspace, workspaceApiKey } from "@featul/db";
import { getWorkspaceAccessPlan, requireBoardManagerBySlug } from "../shared/access";
import { getPlanLimits } from "../shared/plan";

export const API_KEY_SCOPES = ["changelog:read", "changelog:write"] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

const KEY_PREFIX = "ftl_";
/** Characters of the key kept in plain text so people can tell keys apart in settings. */
const DISPLAY_PREFIX_LENGTH = KEY_PREFIX.length + 8;
/** Skip the `lastUsedAt` write when the key was already marked recently. */
const LAST_USED_WRITE_INTERVAL_MS = 60_000;

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** A new random key with the hash and display prefix to store. */
export function generateApiKey(): { key: string; keyHash: string; prefix: string } {
  const key = KEY_PREFIX + randomBytes(32).toString("base64url");
  return { key, keyHash: hashApiKey(key), prefix: key.slice(0, DISPLAY_PREFIX_LENGTH) };
}

export type ApiKeyContext = {
  keyId: string;
  scopes: string[];
  /** The key's creator; entries created through the API are credited to them. */
  userId: string;
  workspace: {
    id: string;
    slug: string;
    ownerId: string;
    customDomain: string | null;
  };
};

function readBearerToken(req: Request): string {
  const header = req.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || "";
}

/**
 * Resolves the `Authorization: Bearer ftl_...` header to a workspace.
 * The creator must still be able to manage boards there and the plan must include integrations.
 */
export async function authenticateApiKey(db: any, req: Request): Promise<ApiKeyContext> {
  const token = readBearerToken(req);
  if (!token) {
    throw new ApiError(401, "unauthorized", "Missing API key. Send it as `Authorization: Bearer <key>`.");
  }
  if (!token.startsWith(KEY_PREFIX)) {
    throw new ApiError(401, "unauthorized", "Invalid API key");
  }

  const [row] = await db
    .select({
      id: workspaceApiKey.id,
      scopes: workspaceApiKey.scopes,
      createdBy: workspaceApiKey.createdBy,
      expiresAt: workspaceApiKey.expiresAt,
      revokedAt: workspaceApiKey.revokedAt,
      lastUsedAt: workspaceApiKey.lastUsedAt,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
      ownerId: workspace.ownerId,
      customDomain: workspace.customDomain,
    })
    .from(workspaceApiKey)
    .innerJoin(workspace, eq(workspaceApiKey.workspaceId, workspace.id))
    .where(eq(workspaceApiKey.keyHash, hashApiKey(token)))
    .limit(1);

  if (!row || row.revokedAt) {
    throw new ApiError(401, "unauthorized", "Invalid API key");
  }
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(401, "unauthorized", "This API key has expired");
  }
  if (!row.createdBy) {
    throw new ApiError(401, "unauthorized", "The person who created this API key no longer has an account");
  }

  try {
    await requireBoardManagerBySlug({ db, session: { user: { id: row.createdBy } } }, row.workspaceSlug);
  } catch {
    throw new ApiError(
      401,
      "unauthorized",
      "The person who created this API key can no longer manage this workspace",
    );
  }

  const limits = getPlanLimits(await getWorkspaceAccessPlan(row.workspaceId));
  if (!limits.allowIntegrations) {
    throw new ApiError(403, "plan_required", "The API is available on Starter or Professional plans");
  }

  if (!row.lastUsedAt || Date.now() - row.lastUsedAt.getTime() > LAST_USED_WRITE_INTERVAL_MS) {
    const cutoff = new Date(Date.now() - LAST_USED_WRITE_INTERVAL_MS);
    await db
      .update(workspaceApiKey)
      .set({ lastUsedAt: new Date() })
      .where(
        and(
          eq(workspaceApiKey.id, row.id),
          or(isNull(workspaceApiKey.lastUsedAt), lt(workspaceApiKey.lastUsedAt, cutoff)),
        ),
      );
  }

  return {
    keyId: row.id,
    scopes: Array.isArray(row.scopes) ? row.scopes : [],
    userId: row.createdBy,
    workspace: {
      id: row.workspaceId,
      slug: row.workspaceSlug,
      ownerId: row.ownerId,
      customDomain: row.customDomain ?? null,
    },
  };
}

export function requireScope(key: ApiKeyContext, scope: ApiKeyScope) {
  if (!key.scopes.includes(scope)) {
    throw new ApiError(403, "insufficient_scope", `This API key is missing the \`${scope}\` scope`);
  }
}
