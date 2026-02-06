import { db, board, post, user, workspaceMember } from "@featul/db";
import { and, eq, sql } from "drizzle-orm";
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

type RawPostRow = SubdomainRequestDetailData & {
  authorId: string | null;
  metadata: Record<string, any> | null;
  author:
    | {
        name: string | null;
        image: string | null;
        email: string | null;
      }
    | null;
};

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

  const rawPost = await loadPostWithAuthorAndBoard(ws.id, postSlug);
  if (!rawPost) return null;

  const postWithAuthor = ensureAuthorAvatar(rawPost, { defaultEmail: "" });

  const isOwner = !!rawPost.authorId && rawPost.authorId === ws.ownerId;

  const hasVoted = await readHasVotedForPost(rawPost.id);
  const { initialComments, initialCollapsedIds } = await loadPostComments(rawPost.id);

  const post: SubdomainRequestDetailData = {
    ...postWithAuthor,
    hasVoted,
    isOwner,
    isFeatul: rawPost.authorId === "featul-founder",
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

  return { ...(p as any), mergedCount, mergedInto } as RawPostRow;
}
