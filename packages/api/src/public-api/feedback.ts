import { and, asc, desc, eq, gte, ilike, inArray, isNull, notInArray, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { activityLog, board, changelogEntry, comment, post, postTag, tag, user } from "@featul/db";
import { ACTIVITY_ACTIONS } from "../activity/actions";
import { publicPortalOrigin } from "../changelog/notify";
import { getChangelogTags } from "../changelog/types";
import { createCommentAtomically } from "../post/comments";
import { mergePostInto } from "../post/merge";
import { STATUSES, normalizeStatus } from "../shared/status";
import { toSlug } from "../shared/slug";
import { notifyPostStatusChange } from "../status/notify";
import { ApiError, type ApiKeyContext } from "./keys";

const EXCERPT_CHARS = 280;
const COMMENT_LIMIT = 100;
/** Upper bound on status-change rows scanned for `completedAfter`. */
const COMPLETION_SCAN_LIMIT = 5000;

const idSchema = z.string().trim().min(1).max(128);
const statusSchema = z.enum(STATUSES);
const tagListSchema = z.array(z.string().trim().min(1).max(64)).max(20);
/** Comma-separated values in a query string, e.g. `status=pending,review`. */
const csv = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.split(",").map((part) => part.trim()).filter(Boolean) : value),
    z.array(item).max(20),
  );
/** `true`/`false` from a query string; `z.coerce.boolean()` would read "false" as true. */
const queryBoolean = z.preprocess(
  (value) => (value === "true" ? true : value === "false" ? false : value),
  z.boolean(),
);

export const listFeedbackSchema = z.object({
  /** Board slugs. */
  board: csv(z.string().min(1).max(64)).optional(),
  /** Roadmap statuses: pending, review, planned, progress, completed, closed. */
  status: csv(statusSchema).optional(),
  /** Tag names or slugs; posts with any of them match. */
  tag: csv(z.string().min(1).max(64)).optional(),
  /** Only posts without tags, handy for triage. */
  untagged: queryBoolean.optional(),
  /** Snoozed posts are hidden by default, like in the dashboard. */
  includeSnoozed: queryBoolean.optional(),
  /** Posts moved to completed on or after this date. */
  completedAfter: z.coerce.date().optional(),
  /** Leave out posts already linked from a changelog entry. */
  notInChangelog: queryBoolean.optional(),
  /** Matches title and description. */
  search: z.string().trim().max(128).optional(),
  /** Moderation state. Defaults to published. */
  state: z.enum(["published", "pending_approval", "archived", "spam"]).default("published"),
  createdAfter: z.coerce.date().optional(),
  updatedAfter: z.coerce.date().optional(),
  sort: z.enum(["newest", "oldest", "votes", "comments", "updated"]).default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const updateFeedbackSchema = z
  .object({
    title: z.string().trim().min(1).max(256).optional(),
    status: statusSchema.optional(),
    /** Board slug to move the post to. */
    board: z.string().trim().min(1).max(64).optional(),
    /** Replaces every tag on the post. */
    tags: tagListSchema.optional(),
    addTags: tagListSchema.optional(),
    removeTags: tagListSchema.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), "Send at least one field to update")
  .refine((value) => !(value.tags && (value.addTags || value.removeTags)), "Send `tags` or `addTags`/`removeTags`, not both");

export const mergeFeedbackSchema = z.object({
  /** The post that absorbs the duplicate. */
  targetId: idSchema,
  reason: z.string().trim().max(500).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  /** Internal notes are only visible to workspace members. Defaults to true. */
  internal: z.boolean().default(true),
});

type PostRow = typeof post.$inferSelect;
type TagRow = { id: string; name: string; slug: string; color: string | null };
type FeedbackRow = PostRow & { boardSlug: string; boardName: string };

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function excerpt(content: string) {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > EXCERPT_CHARS ? `${text.slice(0, EXCERPT_CHARS - 1)}…` : text;
}

async function workspaceTags(db: any, workspaceId: string): Promise<TagRow[]> {
  return db
    .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
    .from(tag)
    .where(and(eq(tag.workspaceId, workspaceId), or(eq(tag.isActive, true), isNull(tag.isActive))))
    .orderBy(asc(tag.name));
}

/** Maps tag names or slugs to workspace tag ids, rejecting any that don't exist. */
function resolveTags(all: TagRow[], requested: string[]): string[] {
  const byKey = new Map<string, string>();
  for (const row of all) {
    byKey.set(row.name.toLowerCase(), row.id);
    byKey.set(row.slug.toLowerCase(), row.id);
  }
  const ids: string[] = [];
  const unknown: string[] = [];
  for (const name of requested) {
    const id = byKey.get(name.toLowerCase()) ?? byKey.get(toSlug(name));
    if (id) ids.push(id);
    else unknown.push(name);
  }
  if (unknown.length > 0) {
    const available = all.map((row) => row.name).join(", ") || "none";
    throw new ApiError(400, "unknown_tags", `Unknown tags: ${unknown.join(", ")}. Available tags: ${available}`);
  }
  return [...new Set(ids)];
}

async function tagsByPost(db: any, postIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (postIds.length === 0) return map;
  const rows: { postId: string; name: string }[] = await db
    .select({ postId: postTag.postId, name: tag.name })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(inArray(postTag.postId, postIds))
    .orderBy(asc(tag.name));
  for (const row of rows) map.set(row.postId, [...(map.get(row.postId) ?? []), row.name]);
  return map;
}

function serialize(row: FeedbackRow, key: ApiKeyContext, tags: string[]) {
  const origin = publicPortalOrigin(key.workspace.slug, key.workspace.customDomain);
  return {
    id: row.id,
    title: row.title,
    excerpt: excerpt(row.content),
    board: { slug: row.boardSlug, name: row.boardName },
    status: normalizeStatus(row.roadmapStatus || "pending"),
    state: row.status,
    tags,
    upvotes: row.upvotes ?? 0,
    commentCount: row.commentCount ?? 0,
    duplicateOfId: row.duplicateOfId,
    url: `${origin}/board/p/${row.slug}`,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const feedbackColumns = { post, boardSlug: board.slug, boardName: board.name };

/** The workspace's active feedback boards (not the roadmap/changelog system boards). */
function feedbackBoards(key: ApiKeyContext): SQL[] {
  return [eq(board.workspaceId, key.workspace.id), eq(board.isSystem, false), eq(board.isActive, true)];
}

/** Posts whose status moved to completed since `since`, from the activity log of status changes. */
async function completedSince(db: any, key: ApiKeyContext, since: Date): Promise<string[]> {
  const rows: { entityId: string; metadata: unknown }[] = await db
    .select({ entityId: activityLog.entityId, metadata: activityLog.metadata })
    .from(activityLog)
    .where(
      and(
        eq(activityLog.workspaceId, key.workspace.id),
        eq(activityLog.entity, "post"),
        inArray(activityLog.action, [ACTIVITY_ACTIONS.POST_UPDATED, ACTIVITY_ACTIONS.POST_META_UPDATED]),
        gte(activityLog.createdAt, since),
      ),
    )
    .orderBy(desc(activityLog.createdAt))
    .limit(COMPLETION_SCAN_LIMIT);
  const ids = new Set<string>();
  for (const row of rows) {
    const meta = (row.metadata ?? {}) as { fromStatus?: unknown; toStatus?: unknown };
    // Edits that leave the status alone log `fromStatus: null`, so require a real transition.
    if (typeof meta.fromStatus !== "string" || typeof meta.toStatus !== "string") continue;
    if (normalizeStatus(meta.toStatus) === "completed" && normalizeStatus(meta.fromStatus) !== "completed") {
      ids.add(row.entityId);
    }
  }
  return [...ids];
}

/** Feedback post ids already linked from one of the workspace's changelog entries. */
async function postsInChangelog(db: any, key: ApiKeyContext): Promise<string[]> {
  const rows: { ids: string[] | null }[] = await db
    .select({ ids: changelogEntry.relatedPostIds })
    .from(changelogEntry)
    .innerJoin(board, eq(changelogEntry.boardId, board.id))
    .where(eq(board.workspaceId, key.workspace.id));
  return [...new Set(rows.flatMap((row) => (Array.isArray(row.ids) ? row.ids : [])))];
}

function flatten(rows: { post: PostRow; boardSlug: string; boardName: string }[]): FeedbackRow[] {
  return rows.map((row) => ({ ...row.post, boardSlug: row.boardSlug, boardName: row.boardName }));
}

/** A post on one of the workspace's feedback boards, or a 404. */
async function findFeedback(db: any, key: ApiKeyContext, id: string): Promise<FeedbackRow> {
  const rows = await db
    .select(feedbackColumns)
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(eq(post.id, id), ...feedbackBoards(key)))
    .limit(1);
  const [row] = flatten(rows);
  if (!row) throw new ApiError(404, "not_found", "Feedback post not found");
  return row;
}

/** Boards, roadmap statuses and tags: what an agent needs before it filters, triages or drafts. */
export async function getFeedbackOverview(db: any, key: ApiKeyContext) {
  const boards: { slug: string; name: string; isPublic: boolean; postCount: number }[] = await db
    .select({
      slug: board.slug,
      name: board.name,
      isPublic: board.isPublic,
      postCount: sql<number>`(select count(*)::int from ${post} where ${post.boardId} = ${board.id} and ${post.status} = 'published')`,
    })
    .from(board)
    .where(and(...feedbackBoards(key)))
    .orderBy(asc(board.sortOrder), asc(board.name));

  const statusCounts: { status: string | null; count: number }[] = await db
    .select({ status: post.roadmapStatus, count: sql<number>`count(*)::int` })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(...feedbackBoards(key), eq(post.status, "published")))
    .groupBy(post.roadmapStatus);
  const counts = new Map<string, number>();
  for (const row of statusCounts) {
    const status = normalizeStatus(row.status || "pending");
    counts.set(status, (counts.get(status) ?? 0) + row.count);
  }

  const tags = await workspaceTags(db, key.workspace.id);
  const [changelogBoard] = await db
    .select({ changelogTags: board.changelogTags })
    .from(board)
    .where(and(eq(board.workspaceId, key.workspace.id), eq(board.systemType, "changelog")))
    .limit(1);
  return {
    workspace: { slug: key.workspace.slug, url: publicPortalOrigin(key.workspace.slug, key.workspace.customDomain) },
    boards,
    statuses: STATUSES.map((status) => ({ id: status, count: counts.get(status) ?? 0 })),
    tags: tags.map((row) => ({ name: row.name, slug: row.slug })),
    /** Separate from feedback tags; used on changelog entries. */
    changelogTags: getChangelogTags(changelogBoard?.changelogTags).map((row) => ({ name: row.name, slug: row.slug })),
  };
}

export async function listFeedback(db: any, key: ApiKeyContext, input: z.infer<typeof listFeedbackSchema>) {
  const filters: SQL[] = [...feedbackBoards(key), eq(post.status, input.state)];
  if (!input.includeSnoozed) {
    filters.push(sql`(${post.snoozedUntil} is null or ${post.snoozedUntil} <= now())`);
  }
  if (input.board?.length) filters.push(inArray(board.slug, input.board));
  if (input.status?.length) {
    const statuses: string[] = [...input.status];
    // Posts created before a status was ever set count as pending.
    const condition = statuses.includes("pending")
      ? or(inArray(post.roadmapStatus, statuses), isNull(post.roadmapStatus))
      : inArray(post.roadmapStatus, statuses);
    if (condition) filters.push(condition);
  }
  if (input.tag?.length) {
    const ids = resolveTags(await workspaceTags(db, key.workspace.id), input.tag);
    filters.push(
      inArray(post.id, db.select({ id: postTag.postId }).from(postTag).where(inArray(postTag.tagId, ids))),
    );
  }
  if (input.untagged) {
    filters.push(sql`not exists (select 1 from ${postTag} where ${postTag.postId} = ${post.id})`);
  }
  if (input.search) {
    const pattern = `%${escapeLike(input.search)}%`;
    const condition = or(ilike(post.title, pattern), ilike(post.content, pattern));
    if (condition) filters.push(condition);
  }
  if (input.createdAfter) filters.push(gte(post.createdAt, input.createdAfter));
  if (input.updatedAfter) filters.push(gte(post.updatedAt, input.updatedAfter));
  if (input.completedAfter) {
    const ids = await completedSince(db, key, input.completedAfter);
    if (ids.length === 0) return { posts: [], hasMore: false };
    filters.push(inArray(post.id, ids), eq(post.roadmapStatus, "completed"));
  }
  if (input.notInChangelog) {
    const ids = await postsInChangelog(db, key);
    if (ids.length > 0) filters.push(notInArray(post.id, ids));
  }

  const order = {
    newest: [desc(post.createdAt)],
    oldest: [asc(post.createdAt)],
    votes: [desc(post.upvotes), desc(post.createdAt)],
    comments: [desc(post.commentCount), desc(post.createdAt)],
    updated: [desc(post.updatedAt)],
  }[input.sort];

  const rows = flatten(
    await db
      .select(feedbackColumns)
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(and(...filters))
      .orderBy(...order, desc(post.id))
      .limit(input.limit + 1)
      .offset(input.offset),
  );
  const page = rows.slice(0, input.limit);
  const tags = await tagsByPost(db, page.map((row) => row.id));
  return {
    posts: page.map((row) => serialize(row, key, tags.get(row.id) ?? [])),
    hasMore: rows.length > input.limit,
  };
}

/** One post with its full description and comments, internal notes included. */
export async function getFeedback(db: any, key: ApiKeyContext, id: string) {
  const row = await findFeedback(db, key, id);
  const tags = await tagsByPost(db, [row.id]);
  const comments: (typeof comment.$inferSelect)[] = await db
    .select()
    .from(comment)
    .where(and(eq(comment.postId, row.id), eq(comment.status, "published")))
    .orderBy(asc(comment.createdAt))
    .limit(COMMENT_LIMIT + 1);
  return {
    ...serialize(row, key, tags.get(row.id) ?? []),
    content: row.content,
    comments: comments.slice(0, COMMENT_LIMIT).map((item) => ({
      id: item.id,
      parentId: item.parentId,
      content: item.content,
      authorName: item.isAnonymous ? "Anonymous" : item.authorName,
      internal: item.isInternal,
      upvotes: item.upvotes ?? 0,
      createdAt: item.createdAt.toISOString(),
    })),
    hasMoreComments: comments.length > COMMENT_LIMIT,
  };
}

/** Status, tags, board and title changes, logged and notified like edits made in the dashboard. */
export async function updateFeedback(
  db: any,
  key: ApiKeyContext,
  id: string,
  input: z.infer<typeof updateFeedbackSchema>,
) {
  const existing = await findFeedback(db, key, id);
  const updates: Partial<PostRow> = {};
  let toBoardName: string | undefined;

  if (input.title !== undefined && input.title !== existing.title) updates.title = input.title;
  if (input.status !== undefined) updates.roadmapStatus = input.status;
  if (input.board !== undefined && input.board !== existing.boardSlug) {
    const [next] = await db
      .select({ id: board.id, name: board.name })
      .from(board)
      .where(and(...feedbackBoards(key), eq(board.slug, input.board)))
      .limit(1);
    if (!next) throw new ApiError(400, "unknown_board", `Unknown board: ${input.board}`);
    updates.boardId = next.id;
    toBoardName = next.name;
  }

  const previousTags: TagRow[] = await db
    .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, existing.id));
  let nextTagIds: string[] | null = null;
  if (input.tags || input.addTags || input.removeTags) {
    const all = await workspaceTags(db, key.workspace.id);
    if (input.tags) {
      nextTagIds = resolveTags(all, input.tags);
    } else {
      const removed = new Set(resolveTags(all, input.removeTags ?? []));
      nextTagIds = [
        ...new Set([...previousTags.map((row) => row.id), ...resolveTags(all, input.addTags ?? [])]),
      ].filter((tagId) => !removed.has(tagId));
    }
  }

  const statusChanged =
    input.status !== undefined &&
    normalizeStatus(existing.roadmapStatus || "pending") !== normalizeStatus(input.status);
  if (!statusChanged) delete updates.roadmapStatus;
  const previousIds = new Set(previousTags.map((row) => row.id));
  const tagsChanged =
    nextTagIds !== null &&
    (nextTagIds.length !== previousIds.size || nextTagIds.some((tagId) => !previousIds.has(tagId)));
  // Nothing would change: skip the write so `updatedAt` and the activity log stay meaningful.
  if (Object.keys(updates).length === 0 && !tagsChanged) return getFeedback(db, key, existing.id);

  const [updated]: PostRow[] = await db
    .update(post)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(post.id, existing.id))
    .returning();
  if (!updated) throw new ApiError(404, "not_found", "Feedback post not found");

  let addedTags: TagRow[] = [];
  let removedTags: TagRow[] = [];
  let tagSummaries: TagRow[] = [];
  if (nextTagIds && tagsChanged) {
    const nextIds = new Set(nextTagIds);
    await db.delete(postTag).where(eq(postTag.postId, existing.id));
    if (nextTagIds.length > 0) {
      await db.insert(postTag).values(nextTagIds.map((tagId) => ({ postId: existing.id, tagId })));
    }
    const all = await workspaceTags(db, key.workspace.id);
    tagSummaries = all.filter((row) => nextIds.has(row.id));
    addedTags = tagSummaries.filter((row) => !previousIds.has(row.id));
    removedTags = previousTags.filter((row) => !nextIds.has(row.id));
  }

  const fromStatus = existing.roadmapStatus;
  const toStatus = updated.roadmapStatus;

  await db.insert(activityLog).values({
    workspaceId: key.workspace.id,
    userId: key.userId,
    action: ACTIVITY_ACTIONS.POST_UPDATED,
    actionType: "update",
    entity: "post",
    entityId: String(updated.id),
    title: updated.title,
    metadata: {
      boardId: updated.boardId,
      roadmapStatus: toStatus,
      fromStatus: statusChanged ? fromStatus || "pending" : null,
      toStatus,
      previousTitle: updates.title !== undefined ? existing.title : undefined,
      nextTitle: updates.title,
      hasTitleChange: updates.title !== undefined,
      fromBoardName: toBoardName ? existing.boardName : undefined,
      toBoardName,
      hasTagsChange: tagsChanged,
      hasTagsAdded: addedTags.length > 0,
      hasTagsRemoved: removedTags.length > 0,
      tagIds: tagsChanged ? nextTagIds ?? undefined : undefined,
      tags: tagSummaries,
      addedTags,
      removedTags,
      via: "api",
      apiKeyId: key.keyId,
    },
  });

  if (statusChanged) {
    await notifyPostStatusChange({
      db,
      postId: updated.id,
      fromStatus,
      toStatus: toStatus || "pending",
      actorUserId: key.userId,
    });
  }

  return getFeedback(db, key, existing.id);
}

/** Merges a duplicate into `targetId`: votes, comments and tags move over and the duplicate is archived. */
export async function mergeFeedback(
  db: any,
  key: ApiKeyContext,
  id: string,
  input: z.infer<typeof mergeFeedbackSchema>,
) {
  if (id === input.targetId) throw new ApiError(400, "invalid_request", "Cannot merge a post into itself");
  const source = await findFeedback(db, key, id);
  const target = await findFeedback(db, key, input.targetId);
  // Re-merging an archived duplicate would count its votes on a second post.
  if (source.duplicateOfId || source.status === "archived") {
    const into = source.duplicateOfId ? ` into ${source.duplicateOfId}` : "";
    throw new ApiError(409, "already_merged", `This post is already archived${into ? ` (merged${into})` : ""}`);
  }
  if (target.status !== "published") {
    const hint = target.duplicateOfId ? `; it was merged into ${target.duplicateOfId}, merge into that post instead` : "";
    throw new ApiError(400, "invalid_target", `The target post must be published (it is ${target.status})${hint}`);
  }
  const merged = await mergePostInto(db, {
    sourcePost: source,
    targetPost: target,
    workspaceId: key.workspace.id,
    userId: key.userId,
    mergeType: "merge_into",
    reason: input.reason,
    activityMetadata: { via: "api", apiKeyId: key.keyId },
  });
  if (!merged) throw new ApiError(409, "already_merged", "These posts are already merged");
  return getFeedback(db, key, target.id);
}

/** A comment from the key's creator: an internal note by default, or a public reply. */
export async function createFeedbackComment(
  db: any,
  key: ApiKeyContext,
  id: string,
  input: z.infer<typeof createCommentSchema>,
) {
  const target = await findFeedback(db, key, id);
  // Same rules as the dashboard, which applies them to admins too.
  const [settings] = await db
    .select({ allowComments: board.allowComments })
    .from(board)
    .where(eq(board.id, target.boardId))
    .limit(1);
  if (!settings?.allowComments) throw new ApiError(403, "comments_disabled", "Comments are turned off on this board");
  if (target.isLocked) throw new ApiError(403, "post_locked", "This post is locked");
  const [author] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, key.userId))
    .limit(1);
  const { comment: created } = await createCommentAtomically(db, {
    values: {
      postId: target.id,
      parentId: null,
      content: input.content,
      authorId: key.userId,
      authorName: author?.name ?? null,
      authorEmail: author?.email ?? null,
      depth: 0,
      status: "published",
      isInternal: input.internal,
      isAnonymous: false,
    },
    reaction: { userId: key.userId, fingerprint: null },
    activity: {
      workspaceId: key.workspace.id,
      userId: key.userId,
      action: ACTIVITY_ACTIONS.COMMENT_CREATED,
      actionType: "create",
      entity: "comment",
      title: target.title,
      metadata: {
        postId: target.id,
        postTitle: target.title,
        roadmapStatus: target.roadmapStatus,
        parentId: null,
        isAnonymous: false,
        isInternal: input.internal,
        via: "api",
        apiKeyId: key.keyId,
      },
    },
  });
  return {
    id: created.id,
    postId: target.id,
    content: created.content,
    internal: created.isInternal,
    createdAt: created.createdAt.toISOString(),
  };
}
