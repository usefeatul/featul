import { and, eq, gt, inArray, sql } from "drizzle-orm";
import {
  activityLog,
  changelogEntry,
  workspaceNotraConnection,
} from "@featul/db";
import type { NotraPost } from "./notra";
import {
  listNotraPostsPage,
  markdownToTiptapDoc,
  NotraApiError,
  resolveNotraMarkdown,
  toNotraChangelogSlug,
  toPlainText,
} from "./notra";
import {
  decryptSecret,
  encryptSecret,
  getSecretKeyVersion,
  hasSecretKeyVersion,
  SecretCryptoError,
} from "./secret-crypto";

type StatusFilter = "draft" | "published";
type PublishBehavior = "preserve" | "draft_only";
type ImportMode = "upsert" | "create_only";

export type NotraImportSummary = {
  fetchedCount: number;
  importedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  truncatedCount: number;
  limitReached: boolean;
  usedStoredConnection: boolean;
};

export class NotraImportRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many Notra imports. Please wait before trying again.");
    this.name = "NotraImportRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class NotraStoredConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotraStoredConnectionError";
  }
}

export type NotraCredentials = {
  organizationId: string;
  apiKey: string;
};

export async function getStoredNotraConnection(
  db: any,
  workspaceId: string,
): Promise<{
  id: string;
  organizationId: string;
  encryptedApiKey: string;
  keyVersion: string;
} | null> {
  const [connection] = await db
    .select({
      id: workspaceNotraConnection.id,
      organizationId: workspaceNotraConnection.organizationId,
      encryptedApiKey: workspaceNotraConnection.encryptedApiKey,
      keyVersion: workspaceNotraConnection.keyVersion,
    })
    .from(workspaceNotraConnection)
    .where(eq(workspaceNotraConnection.workspaceId, workspaceId))
    .limit(1);

  return connection || null;
}

export async function storeNotraConnection(input: {
  db: any;
  workspaceId: string;
  actorUserId: string;
  organizationId: string;
  apiKey: string;
}): Promise<"created" | "updated"> {
  const organizationId = input.organizationId.trim();
  const apiKey = input.apiKey.trim();
  if (!organizationId || !apiKey) {
    throw new NotraStoredConnectionError(
      "Organization ID and API key are required",
    );
  }

  const keyVersion = getSecretKeyVersion();
  const encryptedApiKey = encryptSecret(apiKey, keyVersion);
  const [existing] = await input.db
    .select({ id: workspaceNotraConnection.id })
    .from(workspaceNotraConnection)
    .where(eq(workspaceNotraConnection.workspaceId, input.workspaceId))
    .limit(1);

  if (existing) {
    await input.db
      .update(workspaceNotraConnection)
      .set({
        organizationId,
        encryptedApiKey,
        keyVersion,
        createdBy: input.actorUserId,
        updatedAt: new Date(),
      })
      .where(eq(workspaceNotraConnection.id, existing.id));
    return "updated";
  }

  await input.db.insert(workspaceNotraConnection).values({
    workspaceId: input.workspaceId,
    organizationId,
    encryptedApiKey,
    keyVersion,
    createdBy: input.actorUserId,
  });
  return "created";
}

export async function deleteStoredNotraConnection(
  db: any,
  workspaceId: string,
): Promise<boolean> {
  const [existing] = await db
    .select({ id: workspaceNotraConnection.id })
    .from(workspaceNotraConnection)
    .where(eq(workspaceNotraConnection.workspaceId, workspaceId))
    .limit(1);
  if (!existing) return false;

  await db
    .delete(workspaceNotraConnection)
    .where(eq(workspaceNotraConnection.workspaceId, workspaceId));
  return true;
}

const NOTRA_PROVIDER = "notra";
const IMPORT_RATE_LIMIT_WINDOW_MS = 60_000;
const IMPORT_RATE_LIMIT_MAX_PER_USER = 3;
const IMPORT_RATE_LIMIT_MAX_PER_WORKSPACE = 6;
const IMPORT_RATE_LIMIT_ACTIONS = [
  "changelog_notra_imported",
  "changelog_notra_import_failed",
] as const;
const NOTRA_MARKDOWN_SOURCE_MAX_CHARS = 200_000;
const NOTRA_HTML_SOURCE_MAX_CHARS = 400_000;
const NOTRA_MARKDOWN_STORED_MAX_CHARS = 120_000;

function parseDateSafe(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return null;
  return new Date(ms);
}

function buildSummary(markdown: string, title: string): string | null {
  const source = markdown.trim();
  if (!source) {
    const fallback = title.trim();
    return fallback ? fallback.slice(0, 512) : null;
  }
  const plain = toPlainText(source);
  if (!plain) return null;
  return plain.slice(0, 512);
}

function trimWithLimit(
  value: string,
  maxChars: number,
): { value: string; truncated: boolean } {
  if (value.length <= maxChars) return { value, truncated: false };
  return { value: value.slice(0, maxChars), truncated: true };
}

async function assertNotraImportRateLimit(
  db: any,
  workspaceId: string,
  userId: string,
): Promise<void> {
  const windowStart = new Date(Date.now() - IMPORT_RATE_LIMIT_WINDOW_MS);
  const [userResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activityLog)
    .where(
      and(
        eq(activityLog.workspaceId, workspaceId),
        eq(activityLog.userId, userId),
        inArray(activityLog.action, [...IMPORT_RATE_LIMIT_ACTIONS]),
        gt(activityLog.createdAt, windowStart),
      ),
    );

  const [workspaceResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activityLog)
    .where(
      and(
        eq(activityLog.workspaceId, workspaceId),
        inArray(activityLog.action, [...IMPORT_RATE_LIMIT_ACTIONS]),
        gt(activityLog.createdAt, windowStart),
      ),
    );

  const userCount = userResult?.count || 0;
  const workspaceCount = workspaceResult?.count || 0;
  if (
    userCount >= IMPORT_RATE_LIMIT_MAX_PER_USER ||
    workspaceCount >= IMPORT_RATE_LIMIT_MAX_PER_WORKSPACE
  ) {
    throw new NotraImportRateLimitError(
      Math.ceil(IMPORT_RATE_LIMIT_WINDOW_MS / 1000),
    );
  }
}

async function resolveCredentials(input: {
  db: any;
  workspaceId: string;
  useStoredConnection: boolean;
  organizationId?: string;
  apiKey?: string;
}): Promise<{ credentials: NotraCredentials; usedStoredConnection: boolean }> {
  if (!input.useStoredConnection) {
    const organizationId = String(input.organizationId || "").trim();
    const apiKey = String(input.apiKey || "").trim();
    if (!organizationId || !apiKey) {
      throw new NotraStoredConnectionError(
        "Organization ID and API key are required",
      );
    }
    return {
      credentials: { organizationId, apiKey },
      usedStoredConnection: false,
    };
  }

  const stored = await getStoredNotraConnection(input.db, input.workspaceId);
  if (!stored) {
    throw new NotraStoredConnectionError(
      "No saved Notra connection found for this workspace",
    );
  }

  let apiKey = "";
  const keyVersion = String(stored.keyVersion || "").trim();
  if (!hasSecretKeyVersion(keyVersion)) {
    throw new NotraStoredConnectionError(
      "Stored Notra credentials use an unsupported key version",
    );
  }
  try {
    apiKey = decryptSecret(stored.encryptedApiKey, keyVersion).trim();
  } catch (error) {
    if (error instanceof SecretCryptoError) {
      throw new NotraStoredConnectionError(
        "Stored Notra credentials could not be decrypted",
      );
    }
    throw error;
  }

  if (!apiKey) {
    throw new NotraStoredConnectionError(
      "Stored Notra credentials are invalid",
    );
  }

  const activeKeyVersion = getSecretKeyVersion();
  if (keyVersion !== activeKeyVersion) {
    const reEncryptedApiKey = encryptSecret(apiKey, activeKeyVersion);
    await input.db
      .update(workspaceNotraConnection)
      .set({
        encryptedApiKey: reEncryptedApiKey,
        keyVersion: activeKeyVersion,
        updatedAt: new Date(),
      })
      .where(eq(workspaceNotraConnection.id, stored.id));
  }

  return {
    credentials: { organizationId: stored.organizationId, apiKey },
    usedStoredConnection: true,
  };
}

function mapRemotePost(input: {
  post: NotraPost;
  publishBehavior: PublishBehavior;
}): {
  title: string;
  slug: string;
  content: Record<string, unknown>;
  summary: string | null;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  sourceExternalId: string;
  sourceImportedAt: Date;
  truncatedCountDelta: number;
} {
  const post = input.post;
  const title = post.title.trim().slice(0, 256) || "Untitled update";

  const markdownInput = trimWithLimit(
    String(post.markdown || ""),
    NOTRA_MARKDOWN_SOURCE_MAX_CHARS,
  );
  const htmlInput = trimWithLimit(
    String(post.content || ""),
    NOTRA_HTML_SOURCE_MAX_CHARS,
  );
  const resolved = resolveNotraMarkdown(markdownInput.value, htmlInput.value);
  const markdownOutput = trimWithLimit(
    resolved,
    NOTRA_MARKDOWN_STORED_MAX_CHARS,
  );

  const truncatedCountDelta =
    (markdownInput.truncated ? 1 : 0) +
    (htmlInput.truncated ? 1 : 0) +
    (markdownOutput.truncated ? 1 : 0);

  const markdown = markdownOutput.value;
  const content = markdownToTiptapDoc(markdown) as Record<string, unknown>;
  const summary = buildSummary(markdown, title);

  const sourceStatus = post.status === "published" ? "published" : "draft";
  const status = input.publishBehavior === "preserve" ? sourceStatus : "draft";

  const createdAt = parseDateSafe(post.createdAt) || new Date();
  const updatedAt = parseDateSafe(post.updatedAt) || createdAt;
  const publishedAt =
    status === "published"
      ? parseDateSafe(post.createdAt) ||
        parseDateSafe(post.updatedAt) ||
        new Date()
      : null;

  return {
    title,
    slug: toNotraChangelogSlug(post.id),
    content,
    summary,
    status,
    createdAt,
    updatedAt,
    publishedAt,
    sourceExternalId: post.id.trim(),
    sourceImportedAt: new Date(),
    truncatedCountDelta,
  };
}

export async function runNotraImport(input: {
  db: any;
  workspaceId: string;
  boardId: string;
  actorUserId: string;
  maxChangelogEntries: number | null;
  currentEntryCount: number;
  status: StatusFilter[];
  limit: number;
  maxPages: number;
  mode: ImportMode;
  publishBehavior: PublishBehavior;
  useStoredConnection: boolean;
  organizationId?: string;
  apiKey?: string;
}): Promise<NotraImportSummary> {
  await assertNotraImportRateLimit(
    input.db,
    input.workspaceId,
    input.actorUserId,
  );

  const { credentials, usedStoredConnection } = await resolveCredentials({
    db: input.db,
    workspaceId: input.workspaceId,
    useStoredConnection: input.useStoredConnection,
    organizationId: input.organizationId,
    apiKey: input.apiKey,
  });

  let currentCount = input.currentEntryCount;
  let page = 1;
  let fetchedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let truncatedCount = 0;
  let limitReached = false;

  while (page <= input.maxPages) {
    const remote = await listNotraPostsPage({
      apiKey: credentials.apiKey,
      organizationId: credentials.organizationId,
      page,
      limit: input.limit,
      status: input.status,
    });

    fetchedCount += remote.posts.length;
    if (remote.posts.length === 0) break;

    const externalIds = remote.posts
      .map((post) => post.id.trim())
      .filter(Boolean);
    const existingRows: Array<{ id: string; sourceExternalId: string | null }> =
      externalIds.length > 0
        ? await input.db
            .select({
              id: changelogEntry.id,
              sourceExternalId: changelogEntry.sourceExternalId,
            })
            .from(changelogEntry)
            .where(
              and(
                eq(changelogEntry.boardId, input.boardId),
                eq(changelogEntry.sourceProvider, NOTRA_PROVIDER),
                inArray(changelogEntry.sourceExternalId, externalIds),
              ),
            )
        : [];
    const existingByExternalId = new Map<string, string>(
      existingRows
        .filter((row) => Boolean(row.sourceExternalId))
        .map((row) => [String(row.sourceExternalId), row.id]),
    );

    for (const post of remote.posts) {
      const mapped = mapRemotePost({
        post,
        publishBehavior: input.publishBehavior,
      });
      truncatedCount += mapped.truncatedCountDelta;
      const existingId = existingByExternalId.get(mapped.sourceExternalId);

      if (existingId) {
        if (input.mode === "create_only") {
          skippedCount += 1;
          continue;
        }

        await input.db
          .update(changelogEntry)
          .set({
            title: mapped.title,
            slug: mapped.slug,
            content: mapped.content,
            summary: mapped.summary,
            status: mapped.status,
            publishedAt: mapped.publishedAt,
            sourceImportedAt: mapped.sourceImportedAt,
            updatedAt: new Date(),
          })
          .where(eq(changelogEntry.id, existingId));
        updatedCount += 1;
        continue;
      }

      if (
        typeof input.maxChangelogEntries === "number" &&
        currentCount >= input.maxChangelogEntries
      ) {
        skippedCount += 1;
        limitReached = true;
        continue;
      }

      await input.db.insert(changelogEntry).values({
        boardId: input.boardId,
        title: mapped.title,
        slug: mapped.slug,
        content: mapped.content,
        summary: mapped.summary,
        coverImage: null,
        authorId: input.actorUserId,
        status: mapped.status,
        tags: [],
        sourceProvider: NOTRA_PROVIDER,
        sourceExternalId: mapped.sourceExternalId,
        sourceImportedAt: mapped.sourceImportedAt,
        publishedAt: mapped.publishedAt,
        createdAt: mapped.createdAt,
        updatedAt: mapped.updatedAt,
      });
      createdCount += 1;
      currentCount += 1;
    }

    const nextPage = remote.pagination.nextPage;
    if (!nextPage || nextPage <= page) break;
    page = nextPage;
  }

  if (usedStoredConnection) {
    await input.db
      .update(workspaceNotraConnection)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(eq(workspaceNotraConnection.workspaceId, input.workspaceId));
  }

  return {
    fetchedCount,
    importedCount: createdCount + updatedCount,
    createdCount,
    updatedCount,
    skippedCount,
    truncatedCount,
    limitReached,
    usedStoredConnection,
  };
}

export { NotraApiError };
