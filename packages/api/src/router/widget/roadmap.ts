import { and, desc, eq, inArray } from "drizzle-orm";
import { board, post, user } from "@featul/db";
import { publicProcedure } from "../../jstack";
import { getRequestFingerprint } from "../../shared/request-fingerprint";
import { getWidgetRequest, loadVotedPostIds, mapWidgetPostRow, resolveViewerId, resolveWidget } from "./resolve";
import { projectInput, viewerSchema } from "./schema";

export const widgetRoadmap = publicProcedure
  .input(projectInput.merge(viewerSchema))
  .get(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(ctx, input.projectId);
    const request = getWidgetRequest(c);
    const viewerId = await resolveViewerId(ctx, input, resolved.widgetSecret);
    const fingerprint = viewerId
      ? null
      : getRequestFingerprint(request, input.fingerprint);

    const rows = await ctx.db
      .select({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        upvotes: post.upvotes,
        roadmapStatus: post.roadmapStatus,
        createdAt: post.createdAt,
        isAnonymous: post.isAnonymous,
        authorName: user.name,
        authorImage: user.image,
        metadata: post.metadata,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .leftJoin(user, eq(post.authorId, user.id))
      .where(
        and(
          eq(board.workspaceId, resolved.workspaceId),
          eq(board.isSystem, false),
          eq(board.isPublic, true),
          inArray(post.roadmapStatus, ["planned", "progress", "completed"]),
        ),
      )
      .orderBy(desc(post.updatedAt))
      .limit(30);

    const votedIds = await loadVotedPostIds(
      ctx,
      rows.map((row: { id: string }) => row.id),
      { userId: viewerId, fingerprint },
    );

    return c.superjson({
      posts: rows.map((row: (typeof rows)[number]) => {
        const mapped = mapWidgetPostRow(row, votedIds.has(row.id));
        return {
          id: mapped.id,
          title: mapped.title,
          content: mapped.content,
          slug: mapped.slug,
          upvotes: mapped.upvotes,
          roadmapStatus: mapped.roadmapStatus,
          createdAt: mapped.createdAt,
          authorName: mapped.authorName,
          authorImage: mapped.authorImage,
          isAnonymous: mapped.isAnonymous,
          hasVoted: mapped.hasVoted,
        };
      }),
    });
  });
