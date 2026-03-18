import { db, board, post, user, workspaceMember } from "@featul/db";
import { and, eq, sql } from "drizzle-orm";
import { getServerSession } from "@featul/auth/session";
import { readHasVotedForPost } from "@/lib/vote.server";
import {
  buildPostSelect,
  ensureAuthorAvatar,
  loadMergedPostData,
  loadPostComments,
  loadWorkspaceBySlug,
} from "@/lib/request-detail";
import type { CommentData } from "@/types/comment";
import type { SubdomainRequestDetailData } from "@/types/subdomain";

type RawPostRow = Omit<
  SubdomainRequestDetailData,
  | "createdAt"
  | "publishedAt"
  | "metadata"
  | "upvotes"
  | "commentCount"
  | "isFeatured"
  | "isLocked"
  | "isPinned"
  | "allowComments"
  | "hidePublicMemberIdentity"
> & {
  authorId: string | null;
  upvotes: number | null;
  commentCount: number | null;
  isFeatured?: boolean | null;
  isLocked?: boolean | null;
  isPinned?: boolean | null;
  allowComments?: boolean | null;
  hidePublicMemberIdentity?: boolean | null;
  createdAt: string | Date;
  publishedAt: string | Date | null;
  metadata: Record<string, unknown> | null;
  author:
    | {
        name: string | null;
        image: string | null;
        email: string | null;
      }
    | null;
};

function toIsoString(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function toOptionalIsoString(value: string | Date | null): string | null {
  if (!value) return null;
  return toIsoString(value);
}

export type PublicBoardRequestDetailPageData = {
  workspaceSlug: string;
  post: SubdomainRequestDetailData;
  initialComments: CommentData[];
  initialCollapsedIds: string[];
  backLink: string;
};

export async function loadPublicBoardRequestDetailPageData({
  subdomain,
  postSlug,
}: {
  subdomain: string;
  postSlug: string;
}): Promise<PublicBoardRequestDetailPageData | null> {
  const ws = await loadWorkspaceBySlug(subdomain);
  if (!ws) return null;

  let viewerCanEdit = false;
  try {
    const session = await getServerSession();
    const userId = session?.user?.id || null;
    if (userId) {
      if (userId === ws.ownerId) {
        viewerCanEdit = true;
      } else {
        const [member] = await db
          .select({
            role: workspaceMember.role,
            permissions: workspaceMember.permissions,
            isActive: workspaceMember.isActive,
          })
          .from(workspaceMember)
          .where(
            and(
              eq(workspaceMember.workspaceId, ws.id),
              eq(workspaceMember.userId, userId),
              eq(workspaceMember.isActive, true)
            )
          )
          .limit(1);
        const perms = (member?.permissions || {}) as Record<string, boolean>;
        if (
          member?.role === "admin" ||
          perms?.canManageBoards ||
          perms?.canModerateAllBoards
        ) {
          viewerCanEdit = true;
        }
      }
    }
  } catch {
    // Ignore session errors; page is still viewable
  }

  const rawPost = await loadPostWithAuthorAndBoard(ws.id, postSlug);
  if (!rawPost) return null;

  const postWithAuthor = ensureAuthorAvatar(rawPost, { defaultEmail: "" });

  const isOwner = !!rawPost.authorId && rawPost.authorId === ws.ownerId;

  const hasVoted = await readHasVotedForPost(rawPost.id);
  const { initialComments, initialCollapsedIds } = await loadPostComments(rawPost.id, "public");

  const post: SubdomainRequestDetailData = {
    id: postWithAuthor.id,
    title: postWithAuthor.title,
    content: postWithAuthor.content ?? null,
    image: postWithAuthor.image ?? null,
    upvotes: postWithAuthor.upvotes ?? 0,
    commentCount: postWithAuthor.commentCount ?? 0,
    roadmapStatus: postWithAuthor.roadmapStatus ?? null,
    isFeatured: postWithAuthor.isFeatured ?? undefined,
    isLocked: postWithAuthor.isLocked ?? undefined,
    isPinned: postWithAuthor.isPinned ?? undefined,
    boardName: postWithAuthor.boardName,
    boardSlug: postWithAuthor.boardSlug,
    allowComments: postWithAuthor.allowComments ?? undefined,
    hidePublicMemberIdentity: postWithAuthor.hidePublicMemberIdentity ?? undefined,
    role: postWithAuthor.role ?? null,
    duplicateOfId: postWithAuthor.duplicateOfId ?? null,
    mergedCount: postWithAuthor.mergedCount ?? 0,
    mergedInto: postWithAuthor.mergedInto ?? null,
    author: postWithAuthor.author,
    metadata: postWithAuthor.metadata ?? null,
    createdAt: toIsoString(postWithAuthor.createdAt),
    publishedAt: toOptionalIsoString(postWithAuthor.publishedAt),
    hasVoted,
    isOwner,
    isFeatul: rawPost.authorId === "featul-founder",
    viewerCanEdit,
  };

  return {
    workspaceSlug: subdomain,
    post,
    initialComments,
    initialCollapsedIds,
    backLink: `/board/${post.boardSlug}`,
  };
}

async function loadPostWithAuthorAndBoard(
  workspaceId: string,
  postSlug: string
): Promise<RawPostRow | null> {
  const [p] = await db
    .select(
      buildPostSelect({
        hidePublicMemberIdentity: board.hidePublicMemberIdentity,
        role: workspaceMember.role,
      })
    )
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .leftJoin(
      workspaceMember,
      and(eq(workspaceMember.userId, post.authorId), eq(workspaceMember.workspaceId, workspaceId))
    )
    .where(
      and(
        eq(board.workspaceId, workspaceId),
        sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
        eq(post.slug, postSlug)
      )
    )
    .limit(1);

  if (!p) return null;

  const { mergedCount, mergedInto } = await loadMergedPostData({
    workspaceId,
    postId: p.id,
    duplicateOfId: p.duplicateOfId,
    includeSources: false,
  });

  return {
    ...p,
    metadata: (p.metadata ?? null) as Record<string, unknown> | null,
    mergedCount,
    mergedInto,
  };
}
