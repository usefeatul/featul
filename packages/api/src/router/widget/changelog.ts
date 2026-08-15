import { and, desc, eq, inArray } from "drizzle-orm";
import {
  board,
  changelogEntry,
  user,
  workspace,
  workspaceMember,
} from "@featul/db";
import { publicProcedure } from "../../jstack";
import { findTagsByIds, getChangelogTags } from "../../shared/changelog-types";
import {
  extractTiptapPlainText,
  resolveAuthorRoleLabel,
  resolveWidget,
} from "./resolve";
import { projectInput } from "./schema";

export const widgetChangelog = publicProcedure
  .input(projectInput)
  .get(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );

    const [wsOwner] = await ctx.db
      .select({ ownerId: workspace.ownerId })
      .from(workspace)
      .where(eq(workspace.id, resolved.workspaceId))
      .limit(1);

    const rows = await ctx.db
      .select({
        id: changelogEntry.id,
        title: changelogEntry.title,
        slug: changelogEntry.slug,
        summary: changelogEntry.summary,
        content: changelogEntry.content,
        publishedAt: changelogEntry.publishedAt,
        tags: changelogEntry.tags,
        coverImage: changelogEntry.coverImage,
        authorId: changelogEntry.authorId,
        authorName: user.name,
        authorImage: user.image,
        boardChangelogTags: board.changelogTags,
      })
      .from(changelogEntry)
      .innerJoin(board, eq(changelogEntry.boardId, board.id))
      .leftJoin(user, eq(changelogEntry.authorId, user.id))
      .where(
        and(
          eq(board.workspaceId, resolved.workspaceId),
          eq(board.systemType, "changelog"),
          eq(board.isPublic, true),
          eq(board.isVisible, true),
          eq(changelogEntry.status, "published"),
        ),
      )
      .orderBy(desc(changelogEntry.publishedAt))
      .limit(20);

    const authorIds: string[] = Array.from(
      new Set(
        rows
          .map((row: (typeof rows)[number]) => row.authorId)
          .filter((id: string | null | undefined): id is string => Boolean(id)),
      ),
    );

    const members =
      authorIds.length > 0
        ? await ctx.db
            .select({
              userId: workspaceMember.userId,
              role: workspaceMember.role,
            })
            .from(workspaceMember)
            .where(
              and(
                eq(workspaceMember.workspaceId, resolved.workspaceId),
                inArray(workspaceMember.userId, authorIds),
              ),
            )
        : [];

    const memberRoleMap = new Map(
      members.map((member: { userId: string; role: string | null }) => [
        member.userId,
        member.role,
      ]),
    );

    return c.superjson({
      entries: rows.map((row: (typeof rows)[number]) => {
        const fromContent = extractTiptapPlainText(row.content);
        const summary =
          typeof row.summary === "string" ? row.summary.trim() : "";
        const preview = (summary || fromContent).trim();
        const isOwner = Boolean(
          row.authorId &&
            wsOwner?.ownerId &&
            String(wsOwner.ownerId) === String(row.authorId),
        );
        const rawRole = row.authorId ? memberRoleMap.get(row.authorId) : null;
        const role = typeof rawRole === "string" ? rawRole : null;
        const authorRoleLabel = resolveAuthorRoleLabel(isOwner, role);
        const allTags = getChangelogTags(row.boardChangelogTags);
        const entryTagIds = Array.isArray(row.tags)
          ? row.tags.filter(
              (id: unknown): id is string => typeof id === "string",
            )
          : [];
        const tags = findTagsByIds(allTags, entryTagIds).map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        }));

        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          summary: summary || null,
          content: row.content,
          preview: preview || null,
          coverImage: row.coverImage || null,
          publishedAt: row.publishedAt,
          tags,
          authorName: row.authorName || null,
          authorImage: row.authorImage || null,
          authorRole: role,
          authorIsOwner: isOwner,
          authorRoleLabel,
          author: {
            name: row.authorName || null,
            image: row.authorImage || null,
            role,
            isOwner,
            roleLabel: authorRoleLabel,
          },
        };
      }),
    });
  });
