import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { activityLog, board, changelogEntry } from "@featul/db";
import { ACTIVITY_ACTIONS } from "../activity/actions";
import { getChangelogTags, type ChangelogTag } from "../changelog/types";
import { notifyChangelogSubscribers, publicPortalOrigin } from "../changelog/notify";
import { markdownToTiptapDoc, toPlainText } from "../notra/content";
import { getWorkspaceAccessPlan } from "../shared/access";
import { getPlanLimits } from "../shared/plan";
import { toSlug, toUrlSlug } from "../shared/slug";
import { entryContentSchema, scheduledAtSchema } from "../validators/changelog";
import { ApiError, type ApiKeyContext } from "./keys";

/** Entries created through the API; `externalId` is stored as the source id for idempotent upserts. */
const API_SOURCE_PROVIDER = "api";
const CONTENT_MAX_CHARS = 120_000;

const externalIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[\w.:/@+-]+$/, "Use letters, numbers, and . _ - : / @ + only");

const tagsSchema = z.array(z.string().trim().min(1).max(64)).max(10);

export const upsertEntrySchema = z.object({
  title: z.string().trim().min(1).max(256),
  /** Markdown body. */
  content: z.string().max(CONTENT_MAX_CHARS).optional(),
  summary: z.string().trim().max(512).optional(),
  /** Changelog tag names or slugs; they must already exist in the workspace. */
  tags: tagsSchema.optional(),
  status: z.enum(["draft", "published"]).optional(),
  scheduledAt: scheduledAtSchema.optional(),
  /** Your own id for this update (release tag, commit SHA...). Sending it again updates the same entry. */
  externalId: externalIdSchema.optional(),
});

export const updateEntrySchema = upsertEntrySchema
  .omit({ externalId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Send at least one field to update");

export const listEntriesSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  externalId: externalIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

type EntryRow = typeof changelogEntry.$inferSelect;

async function getChangelogBoard(db: any, workspaceId: string) {
  const [row] = await db
    .select({ id: board.id, changelogTags: board.changelogTags })
    .from(board)
    .where(and(eq(board.workspaceId, workspaceId), eq(board.systemType, "changelog")))
    .limit(1);
  if (!row) throw new ApiError(404, "not_found", "Changelog board not found");
  return { id: row.id as string, tags: getChangelogTags(row.changelogTags) };
}

/** Maps tag names or slugs to the workspace's tag ids, rejecting any that don't exist. */
function resolveTagIds(allTags: ChangelogTag[], requested: string[]): string[] {
  const byKey = new Map<string, string>();
  for (const tag of allTags) {
    byKey.set(tag.name.toLowerCase(), tag.id);
    if (tag.slug) byKey.set(tag.slug.toLowerCase(), tag.id);
  }
  const ids: string[] = [];
  const unknown: string[] = [];
  for (const name of requested) {
    const id = byKey.get(name.toLowerCase()) ?? byKey.get(toSlug(name));
    if (id) ids.push(id);
    else unknown.push(name);
  }
  if (unknown.length > 0) {
    const available = allTags.map((tag) => tag.name).join(", ") || "none";
    throw new ApiError(
      400,
      "unknown_tags",
      `Unknown changelog tags: ${unknown.join(", ")}. Available tags: ${available}`,
    );
  }
  return [...new Set(ids)];
}

function toContent(markdown: string) {
  return entryContentSchema.parse(markdownToTiptapDoc(markdown)) as Record<string, unknown>;
}

function toSummary(markdown: string, summary: string | undefined) {
  if (summary !== undefined) return summary || null;
  return toPlainText(markdown).slice(0, 512) || null;
}

export function serializeEntry(entry: EntryRow, key: ApiKeyContext, allTags: ChangelogTag[]) {
  const tagsById = new Map(allTags.map((tag) => [tag.id, tag.name]));
  const origin = publicPortalOrigin(key.workspace.slug, key.workspace.customDomain);
  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    status: entry.status,
    summary: entry.summary,
    tags: (entry.tags || []).map((id) => tagsById.get(id)).filter(Boolean),
    externalId: entry.sourceProvider === API_SOURCE_PROVIDER ? entry.sourceExternalId : null,
    url: entry.status === "published" ? `${origin}/changelog/p/${entry.slug}` : null,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    scheduledAt: entry.scheduledAt?.toISOString() ?? null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

async function logActivity(
  db: any,
  key: ApiKeyContext,
  action: string,
  actionType: "create" | "update",
  entry: EntryRow,
) {
  await db.insert(activityLog).values({
    workspaceId: key.workspace.id,
    userId: key.userId,
    action,
    actionType,
    entity: "changelog_entry",
    entityId: String(entry.id),
    title: entry.title,
    metadata: { status: entry.status, via: "api", apiKeyId: key.keyId },
  });
}

/** Writes the given fields to an entry and announces it when it is published for the first time. */
async function applyUpdate(
  db: any,
  key: ApiKeyContext,
  existing: EntryRow,
  input: z.infer<typeof updateEntrySchema>,
  allTags: ChangelogTag[],
): Promise<EntryRow> {
  const updates: Partial<EntryRow> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.content !== undefined) {
    updates.content = toContent(input.content);
    updates.summary = toSummary(input.content, input.summary);
  } else if (input.summary !== undefined) {
    updates.summary = input.summary || null;
  }
  if (input.tags !== undefined) updates.tags = resolveTagIds(allTags, input.tags);

  const isFirstPublish = input.status === "published" && !existing.publishedAt;
  if (input.status === "published") {
    updates.status = "published";
    updates.publishedAt = existing.publishedAt || new Date();
    updates.scheduledAt = null;
  } else if (input.status === "draft") {
    updates.status = "draft";
  }
  if (input.scheduledAt !== undefined && (updates.status ?? existing.status) === "draft") {
    updates.scheduledAt = input.scheduledAt;
  }

  // e.g. only `scheduledAt` for an entry that is already published.
  if (Object.keys(updates).length === 0) return existing;

  const [entry] = await db
    .update(changelogEntry)
    .set(updates)
    .where(eq(changelogEntry.id, existing.id))
    .returning();

  await logActivity(
    db,
    key,
    isFirstPublish ? ACTIVITY_ACTIONS.CHANGELOG_ENTRY_PUBLISHED : ACTIVITY_ACTIONS.CHANGELOG_ENTRY_UPDATED,
    "update",
    entry,
  );
  if (isFirstPublish) await notifyChangelogSubscribers(db, entry.id);
  return entry;
}

async function findByExternalId(db: any, boardId: string, externalId: string): Promise<EntryRow | null> {
  const [row] = await db
    .select()
    .from(changelogEntry)
    .where(
      and(
        eq(changelogEntry.boardId, boardId),
        eq(changelogEntry.sourceProvider, API_SOURCE_PROVIDER),
        eq(changelogEntry.sourceExternalId, externalId),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function findById(db: any, boardId: string, id: string): Promise<EntryRow> {
  const [row] = await db
    .select()
    .from(changelogEntry)
    .where(and(eq(changelogEntry.id, id), eq(changelogEntry.boardId, boardId)))
    .limit(1);
  if (!row) throw new ApiError(404, "not_found", "Changelog entry not found");
  return row;
}

/** Creates an entry, or updates the one with the same `externalId` so CI retries never duplicate. */
export async function upsertChangelogEntry(
  db: any,
  key: ApiKeyContext,
  input: z.infer<typeof upsertEntrySchema>,
) {
  const b = await getChangelogBoard(db, key.workspace.id);

  if (input.externalId) {
    const existing = await findByExternalId(db, b.id, input.externalId);
    if (existing) {
      const entry = await applyUpdate(db, key, existing, input, b.tags);
      return { created: false, entry: serializeEntry(entry, key, b.tags) };
    }
  }

  const limits = getPlanLimits(await getWorkspaceAccessPlan(key.workspace.id));
  if (typeof limits.maxChangelogEntries === "number") {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(changelogEntry)
      .where(eq(changelogEntry.boardId, b.id));
    if ((countResult?.count || 0) >= limits.maxChangelogEntries) {
      throw new ApiError(
        403,
        "limit_reached",
        `Changelog entries limit reached (${limits.maxChangelogEntries})`,
      );
    }
  }

  const isPublished = input.status === "published";
  const values = {
    boardId: b.id,
    title: input.title,
    slug: (toUrlSlug(input.title) || "update") + "-" + Date.now().toString(36),
    content: toContent(input.content ?? ""),
    summary: toSummary(input.content ?? "", input.summary),
    coverImage: null,
    authorId: key.userId,
    authorIds: [key.userId],
    status: isPublished ? ("published" as const) : ("draft" as const),
    tags: resolveTagIds(b.tags, input.tags ?? []),
    sourceProvider: input.externalId ? API_SOURCE_PROVIDER : null,
    sourceExternalId: input.externalId ?? null,
    sourceImportedAt: input.externalId ? new Date() : null,
    publishedAt: isPublished ? new Date() : null,
    scheduledAt: isPublished ? null : (input.scheduledAt ?? null),
  };

  const insert = db.insert(changelogEntry).values(values);
  const [entry]: EntryRow[] = input.externalId
    ? await insert
        .onConflictDoNothing({
          target: [changelogEntry.boardId, changelogEntry.sourceProvider, changelogEntry.sourceExternalId],
        })
        .returning()
    : await insert.returning();

  if (!entry) {
    // A concurrent request with the same externalId created it first.
    const existing = await findByExternalId(db, b.id, input.externalId!);
    if (!existing) throw new ApiError(409, "conflict", "Entry was modified concurrently, retry the request");
    const updated = await applyUpdate(db, key, existing, input, b.tags);
    return { created: false, entry: serializeEntry(updated, key, b.tags) };
  }

  await logActivity(db, key, ACTIVITY_ACTIONS.CHANGELOG_ENTRY_CREATED, "create", entry);
  if (isPublished) await notifyChangelogSubscribers(db, entry.id);
  return { created: true, entry: serializeEntry(entry, key, b.tags) };
}

export async function updateChangelogEntry(
  db: any,
  key: ApiKeyContext,
  id: string,
  input: z.infer<typeof updateEntrySchema>,
) {
  const b = await getChangelogBoard(db, key.workspace.id);
  const existing = await findById(db, b.id, id);
  const entry = await applyUpdate(db, key, existing, input, b.tags);
  return serializeEntry(entry, key, b.tags);
}

export async function getChangelogEntry(db: any, key: ApiKeyContext, id: string) {
  const b = await getChangelogBoard(db, key.workspace.id);
  return serializeEntry(await findById(db, b.id, id), key, b.tags);
}

export async function listChangelogEntries(
  db: any,
  key: ApiKeyContext,
  input: z.infer<typeof listEntriesSchema>,
) {
  const b = await getChangelogBoard(db, key.workspace.id);
  const filters = [eq(changelogEntry.boardId, b.id)];
  if (input.status) filters.push(eq(changelogEntry.status, input.status));
  if (input.externalId) {
    filters.push(eq(changelogEntry.sourceProvider, API_SOURCE_PROVIDER));
    filters.push(eq(changelogEntry.sourceExternalId, input.externalId));
  }

  const rows: EntryRow[] = await db
    .select()
    .from(changelogEntry)
    .where(and(...filters))
    .orderBy(desc(changelogEntry.createdAt), desc(changelogEntry.id))
    .limit(input.limit + 1)
    .offset(input.offset);

  return {
    entries: rows.slice(0, input.limit).map((row) => serializeEntry(row, key, b.tags)),
    hasMore: rows.length > input.limit,
  };
}
