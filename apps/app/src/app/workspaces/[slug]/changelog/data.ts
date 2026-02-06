import { db, workspace, board, changelogEntry, tag, user } from "@featul/db";
import { and, eq, desc, sql } from "drizzle-orm";
import type { JSONContent } from "@featul/editor";

export interface WorkspaceTag {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

export interface ChangelogEntryData {
    id: string;
    title: string;
    slug: string;
    content: JSONContent;
    summary?: string | null;
    coverImage?: string | null;
    authorId: string;
    authorName?: string | null;
    authorImage?: string | null;
    status: "draft" | "published";
    tags: string[]; // Tag IDs
    publishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChangelogEntryWithTags extends Omit<ChangelogEntryData, 'tags'> {
    tags: WorkspaceTag[]; // Resolved tags
}

export interface ChangelogListData {
    entries: ChangelogEntryWithTags[];
    total: number;
    availableTags: WorkspaceTag[];
}

async function getWorkspaceTags(workspaceId: string): Promise<WorkspaceTag[]> {
    const tags = await db
        .select({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
        })
        .from(tag)
        .where(eq(tag.workspaceId, workspaceId))
        .orderBy(tag.name);

    return tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color || null,
    }));
}

export async function getChangelogListData(
    workspaceSlug: string,
    options?: { status?: "draft" | "published"; limit?: number; offset?: number }
): Promise<ChangelogListData | null> {
    const [ws] = await db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.slug, workspaceSlug))
        .limit(1);

    if (!ws) return null;

    const [b] = await db
        .select({ id: board.id })
        .from(board)
        .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
        .limit(1);

    if (!b) return null;

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const whereConditions = [eq(changelogEntry.boardId, b.id)];
    if (options?.status) {
        whereConditions.push(eq(changelogEntry.status, options.status));
    }

    const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(changelogEntry)
        .where(and(...whereConditions));


    const entries = await db
        .select({
            id: changelogEntry.id,
            title: changelogEntry.title,
            slug: changelogEntry.slug,
            content: changelogEntry.content,
            summary: changelogEntry.summary,
            coverImage: changelogEntry.coverImage,
            authorId: changelogEntry.authorId,
            status: changelogEntry.status,
            tags: changelogEntry.tags,
            publishedAt: changelogEntry.publishedAt,
            createdAt: changelogEntry.createdAt,
            updatedAt: changelogEntry.updatedAt,
            authorName: user.name,
            authorImage: user.image,
        })
        .from(changelogEntry)
        .leftJoin(user, eq(changelogEntry.authorId, user.id))
        .where(and(...whereConditions))
        .orderBy(desc(changelogEntry.updatedAt))
        .limit(limit)
        .offset(offset);

    // Get workspace tags for the dropdown
    const availableTags = await getWorkspaceTags(ws.id);

    const tagsMap = new Map(availableTags.map((t) => [t.id, t]));

    const entriesWithTags = entries.map((e) => ({
        ...e,
        status: e.status as "draft" | "published",
        content: e.content as JSONContent,
        tags: (e.tags as string[]).map((id) => tagsMap.get(id)).filter(Boolean) as WorkspaceTag[],
    }));

    return {
        entries: entriesWithTags,
        total: countResult?.count || 0,
        availableTags,
    };
}

export async function getChangelogTags(workspaceSlug: string): Promise<WorkspaceTag[]> {
    const [ws] = await db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.slug, workspaceSlug))
        .limit(1);

    if (!ws) return [];

    return getWorkspaceTags(ws.id);
}

export async function getChangelogEntryForEdit(
    workspaceSlug: string,
    entryId: string
): Promise<{ entry: ChangelogEntryData; availableTags: WorkspaceTag[] } | null> {
    const [ws] = await db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.slug, workspaceSlug))
        .limit(1);

    if (!ws) return null;

    const [b] = await db
        .select({ id: board.id })
        .from(board)
        .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
        .limit(1);

    if (!b) return null;

    const [entry] = await db
        .select()
        .from(changelogEntry)
        .where(and(eq(changelogEntry.id, entryId), eq(changelogEntry.boardId, b.id)))
        .limit(1);

    if (!entry) return null;

    // Get workspace tags for the dropdown
    const availableTags = await getWorkspaceTags(ws.id);

    return {
        entry: {
            ...entry,
            status: entry.status as "draft" | "published",
            content: entry.content as JSONContent,
            tags: entry.tags as string[],
        },
        availableTags,
    };
}
