import React from "react";
import { UpvoteButton } from "../../upvote/UpvoteButton";
import CommentList from "../../comments/CommentList";
import CommentCounter from "../../comments/CommentCounter";
import type { CommentData } from "../../../types/comment";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { getDisplayUser } from "@/utils/user";
import type { SubdomainRequestDetailData } from "../../../types/subdomain";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { RequestActions } from "./RequestActions";
import { isOnboardingPost } from "@/lib/onboarding/post";
import { OnboardingPostContent } from "@/components/requests/OnboardingPostContent";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
import { cn } from "@featul/ui/lib/utils";
import { MergeSubmissionSection } from "@/components/requests/MergeSubmission";



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
  const showOnboardingContent = isOnboardingPost(post.metadata)
  const normalizedContent = showOnboardingContent
    ? post.content
    : post.content?.replace(/\n{2,}/g, "\n")

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
    <div className="min-w-0 space-y-4">
      <article className={settingsCardShellClass}>
        <header className="flex items-center justify-between py-2">
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
        </header>
        <div className={cn(settingsCardInnerClass)}>

      {/* Post Title */}
      <h1 className="text-xl font-semibold text-foreground mb-4">
        {post.title}
      </h1>

      {/* Image */}

      {normalizedContent ? (
        showOnboardingContent ? (
          <OnboardingPostContent content={normalizedContent} className="mb-6" />
        ) : (
          <div className="prose dark:prose-invert text-sm text-accent mb-6 wrap-break-word whitespace-pre-wrap leading-6">
            {normalizedContent}
          </div>
        )
      ) : null}

      {/* Content */}
      <PostImageGallery
        image={post.image}
        metadata={post.metadata}
        alt={post.title}
        className="mb-4"
      />
      <MergeSubmissionSection
        className="mb-4"
        mergedInto={post.mergedInto}
        mergedIntoHref={
          post.mergedInto ? `/board/p/${post.mergedInto.slug}` : undefined
        }
        mergedSources={post.mergedSources}
        mergedCount={post.mergedCount}
        sourceHref={(slug) => `/board/p/${slug}`}
        hidePublicMemberIdentity={post.hidePublicMemberIdentity}
      />
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

        </div>
      </article>

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
  );
}
