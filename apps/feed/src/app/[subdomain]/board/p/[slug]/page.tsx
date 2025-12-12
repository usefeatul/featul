import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, workspace, board, post, user, workspaceMember } from "@oreilla/db";
import { eq, and, sql } from "drizzle-orm";
import SubdomainRequestDetail from "@/components/subdomain/SubdomainRequestDetail";
import { client } from "@oreilla/api/client";
import { readHasVotedForPost } from "@/lib/vote.server";
import { readInitialCollapsedCommentIds } from "@/lib/comments.server";
import { createPostMetadata } from "@/lib/seo";
import { createHash } from "crypto";
import { randomAvatarUrl } from "@/utils/avatar";

export const revalidate = 0;

type Props = { params: Promise<{ subdomain: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  return createPostMetadata(subdomain, slug, "/board/p");
}

export default async function PublicBoardRequestDetailPage({ params }: Props) {
  const { subdomain, slug: postSlug } = await params;
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.slug, subdomain))
    .limit(1);
  if (!ws) return notFound();

  const [p] = await db
    .select({
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      upvotes: post.upvotes,
      commentCount: post.commentCount,
      roadmapStatus: post.roadmapStatus,
      isFeatured: post.isFeatured,
      isLocked: post.isLocked,
      isPinned: post.isPinned,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      boardName: board.name,
      boardSlug: board.slug,
      metadata: post.metadata,
      role: workspaceMember.role,
      authorId: post.authorId,
      author: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .leftJoin(workspaceMember, and(eq(workspaceMember.userId, post.authorId), eq(workspaceMember.workspaceId, ws.id)))
    .where(
      and(
        eq(board.workspaceId, ws.id),
        sql`(board.system_type is null or board.system_type not in ('roadmap','changelog'))`,
        eq(post.slug, postSlug)
      )
    )
    .limit(1);
  if (!p) return notFound();

  if ((!p.author || !p.author.name) && (p.metadata as any)?.fingerprint) {
    const avatarSeed = createHash("sha256")
      .update((p.metadata as any).fingerprint)
      .digest("hex");
    if (!p.author) {
      p.author = { name: "Guest", image: null, email: "" };
    }
    p.author!.image = randomAvatarUrl(avatarSeed);
    p.author!.name = "Guest";
  }

  const hasVoted = await readHasVotedForPost(p.id);
  const commentsRes = await client.comment.list.$get({ postId: p.id });
  const commentsJson = await commentsRes.json().catch(() => ({ comments: [] }));
  const initialComments = Array.isArray((commentsJson as any)?.comments)
    ? (commentsJson as any).comments
    : [];
  const initialCollapsedIds = await readInitialCollapsedCommentIds(p.id);

  return (
    <SubdomainRequestDetail
      post={{ ...p, hasVoted, isOwner: p.authorId === ws.ownerId } as any}
      workspaceSlug={subdomain}
      initialComments={initialComments as any}
      initialCollapsedIds={initialCollapsedIds}
      backLink={`/board/${p.boardSlug}`}
    />
  );
}
