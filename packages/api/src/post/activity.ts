import { getPostActivityDetails } from "../activity/details";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  activityLog,
  board,
  db,
  post,
  user,
  workspaceMember,
} from "@featul/db";
import { HTTPException } from "hono/http-exception";
import { requirePostAccess } from "./access";
import {
  describePostActivity,
  POST_TIMELINE_ACTIONS,
  type PostActivityPage,
} from "../activity/post";

export async function listPostActivity(
  database: typeof db,
  input: { postId: string; surface: "workspace" | "public"; offset: number },
  userId: string | null,
): Promise<PostActivityPage> {
  const target = await requirePostAccess(database, input.postId, userId, {
    allowUnpublishedForMembers: input.surface === "workspace",
  });
  if (input.surface === "workspace" && !target.member) {
    throw new HTTPException(403, { message: "Workspace access required" });
  }
  const internal = input.surface === "workspace" && target.member;
  const [settings] = await database
    .select({ hideIdentity: board.hidePublicMemberIdentity })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(eq(post.id, input.postId))
    .limit(1);
  const limit = 30;
  const rows = await database
    .select({
      totalCount: sql<number>`count(*) over()`.mapWith(Number),
      id: activityLog.id,
      action: activityLog.action,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      actorId: user.id,
      memberRole: workspaceMember.role,
      name: user.name,
      image: user.image,
    })
    .from(activityLog)
    .leftJoin(user, eq(activityLog.userId, user.id))
    .leftJoin(
      workspaceMember,
      and(
        eq(workspaceMember.userId, user.id),
        eq(workspaceMember.workspaceId, target.workspaceId),
        eq(workspaceMember.isActive, true),
      ),
    )
    .where(
      and(
        eq(activityLog.workspaceId, target.workspaceId),
        eq(activityLog.entity, "post"),
        eq(activityLog.entityId, input.postId),
        inArray(activityLog.action, [...POST_TIMELINE_ACTIONS]),
      ),
    )
    .orderBy(desc(activityLog.createdAt), desc(activityLog.id))
    .limit(limit + 1)
    .offset(input.offset);

  return {
    totalCount: rows[0]?.totalCount ?? 0,
    items: rows.slice(0, limit).map((row) => ({
      ...getPostActivityDetails(row.action, row.metadata, internal),
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      description: describePostActivity(row.action, row.metadata, internal),
      actor:
        !internal && settings?.hideIdentity
          ? { name: "Member", image: null, role: null, isOwner: false }
          : {
              name: row.name || "Guest",
              image: row.image,
              role: row.memberRole ?? null,
              isOwner: row.actorId === target.ownerId,
            },
    })),
    nextOffset: rows.length > limit ? input.offset + limit : null,
  };
}
