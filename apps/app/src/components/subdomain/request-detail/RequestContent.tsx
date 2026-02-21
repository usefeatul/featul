import React from "react";
import Link from "next/link";
import { UpvoteButton } from "../../upvote/UpvoteButton";
import CommentList from "../../comments/CommentList";
import CommentCounter from "../../comments/CommentCounter";
import type { CommentData } from "../../../types/comment";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { getDisplayUser } from "@/utils/user-utils";
import type { SubdomainRequestDetailData } from "../../../types/subdomain";
import ContentImage from "@/components/global/ContentImage";
import { RequestActions } from "./RequestActions";



interface RequestContentProps {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
  initialComments?: CommentData[];
  initialCollapsedIds?: string[];
}

export function RequestContent({
  post,
  workspaceSlug,
  initialComments,
  initialCollapsedIds,
}: RequestContentProps) {
  const visibleCommentCount = initialComments?.length ?? post.commentCount

  const rawDisplayAuthor = getDisplayUser(
    post.author
      ? {
        name: post.author.name ?? undefined,
        image: post.author.image ?? undefined,
        email: post.author.email ?? undefined,
      }
      : undefined
  );

  // Apply hidePublicMemberIdentity - only hide if it's enabled AND user is not a guest
  const isGuest = !post.author?.name || rawDisplayAuthor.name === "Guest"
  const showHiddenIdentity = post.hidePublicMemberIdentity && !isGuest

  return (
    <div className="min-w-0 rounded-md border bg-card dark:bg-background p-4 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
      {/* Status & Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2">
          <StatusIcon
            status={post.roadmapStatus || undefined}
            className="size-5 text-foreground/80"
          />
          <span className="text-sm text-accent">
            {statusLabel(String(post.roadmapStatus || "pending"))}
          </span>
        </div>
        <RequestActions post={post} workspaceSlug={workspaceSlug} />
      </div>

      {/* Post Title */}
      <h1 className="text-xl font-semibold text-foreground mb-4">
        {post.title}
      </h1>

      {/* Image */}

      {post.content ? (
        <div className="prose dark:prose-invert text-sm text-accent mb-6">
          {post.content}
        </div>
      ) : null}

      {/* Content */}
      {post.image ? (
        <>
          <ContentImage
            url={post.image}
            alt={post.title}
            className="w-48 h-36 mb-4"
          />
          {post.duplicateOfId && post.mergedInto ? (
            <div className="mt-2 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                <StatusIcon status={post.mergedInto.roadmapStatus || "pending"} className="size-4" />
                <span className="text-accent">Merged into</span>
                <Link
                  href={`/board/p/${post.mergedInto.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {post.mergedInto.title}
                </Link>
                {post.mergedInto.boardName ? (
                  <span className="text-accent">({post.mergedInto.boardName})</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {/* Fallback: show merged banner centered even without image */}
      {!post.image && post.duplicateOfId && post.mergedInto ? (
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
            <StatusIcon status={post.mergedInto.roadmapStatus || "pending"} className="size-4" />
            <span className="text-accent">Merged into</span>
            <Link
              href={`/board/p/${post.mergedInto.slug}`}
              className="font-medium text-foreground hover:underline"
            >
              {post.mergedInto.title}
            </Link>
            {post.mergedInto.boardName ? (
              <span className="text-accent">({post.mergedInto.boardName})</span>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* Footer: Author & Upvotes */}
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-3 text-xs text-accent">
          <UpvoteButton
            postId={post.id}
            upvotes={post.upvotes}
            hasVoted={post.hasVoted}
            className="text-xs hover:text-red-500/80"
          />
          <CommentCounter
            postId={post.id}
            initialCount={visibleCommentCount}
            surface="public"
            className="hover:text-foreground transition-colors"
          />
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6 pt-6">
        <CommentList
          postId={post.id}
          initialCount={visibleCommentCount}
          workspaceSlug={workspaceSlug}
          surface="public"
          allowComments={post.allowComments}
          initialComments={initialComments}
          initialCollapsedIds={initialCollapsedIds}
          hidePublicMemberIdentity={showHiddenIdentity}
        />
      </div>
    </div>
  );
}
