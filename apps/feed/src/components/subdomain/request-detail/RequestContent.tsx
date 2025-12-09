 import React from "react";
import { UpvoteButton } from "../../upvote/UpvoteButton";
import CommentList from "../../comments/CommentList";
import CommentCounter from "../../comments/CommentCounter";
import type { CommentData } from "../../../types/comment";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { getInitials, getDisplayUser } from "@/utils/user-utils";
import { randomAvatarUrl } from "@/utils/avatar";
import { SubdomainRequestDetailData } from "../../../types/subdomain";
import ContentImage from "@/components/global/ContentImage";
import { RequestActions } from "./RequestActions";
import RoleBadge from "../../comments/RoleBadge";

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
  const displayAuthor = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined
  );

  return (
    <div className="rounded-lg border bg-card p-6">
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
        <ContentImage
          url={post.image}
          alt={post.title}
          className="w-48 h-36 mb-4"
        />
      ) : null}
      {/* Footer: Author & Upvotes */}
      <div className="flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-2">
          <Avatar className="size-8 relative overflow-visible">
            <AvatarImage
              src={displayAuthor.image || randomAvatarUrl(post.id)}
              alt={displayAuthor.name}
            />
            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
              {getInitials(displayAuthor.name)}
            </AvatarFallback>
            <RoleBadge role={post.role} isOwner={post.isOwner} />
          </Avatar>
          <span className="text-xs text-accent whitespace-nowrap mt-2 max-w-[180px] truncate">
            {displayAuthor.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-accent">
          <UpvoteButton
            postId={post.id}
            upvotes={post.upvotes}
            hasVoted={post.hasVoted}
            className="text-xs hover:text-red-500/80"
            activeBg
          />
          <CommentCounter
            postId={post.id}
            initialCount={post.commentCount}
            className="hover:text-foreground transition-colors"
          />
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6 pt-6">
        <CommentList
          postId={post.id}
          initialCount={post.commentCount}
          workspaceSlug={workspaceSlug}
          initialComments={initialComments}
          initialCollapsedIds={initialCollapsedIds}
        />
      </div>
    </div>
  );
}
