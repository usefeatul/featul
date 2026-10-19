import type { InitialActivity } from "@/types/activity";
import React from "react";
import { UpvoteButton } from "../../upvote/UpvoteButton";
import Discussion from "@/components/requests/discussion";
import CommentCounter from "../../comments/CommentCounter";
import type { CommentData } from "../../../types/comment";
import { StatusChip } from "../StatusChip";
import { getDisplayUser } from "@/utils/user";
import type { SubdomainRequestDetailData } from "../../../types/subdomain";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import { RequestActions } from "./RequestActions";
import { isOnboardingPost } from "@/lib/onboarding/post";
import { OnboardingPostContent } from "@/components/requests/OnboardingPostContent";
import { MergeSubmissionSection } from "@/components/requests/MergeSubmission";
import { PostBody } from "./PostBody";
import { relativeTime } from "@/lib/time";

interface RequestContentProps {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
  initialComments?: CommentData[];
  initialActivity?: InitialActivity;
  initialCollapsedIds?: string[];
}

export function RequestContent({
  post,
  workspaceSlug,
  initialComments,
  initialActivity,
  initialCollapsedIds,
}: RequestContentProps) {
  const visibleCommentCount = initialComments?.length ?? post.commentCount;
  const showOnboardingContent = isOnboardingPost(post.metadata);
  const normalizedContent = showOnboardingContent
    ? post.content
    : post.content?.replace(/\n{2,}/g, "\n");

  const rawDisplayAuthor = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined,
  );

  // Apply hidePublicMemberIdentity - only hide if it's enabled AND user is not a guest
  const isGuest = !post.author?.name || rawDisplayAuthor.name === "Guest";
  const showHiddenIdentity = post.hidePublicMemberIdentity && !isGuest;

  return (
    <div className="min-w-0">
      <article className="pb-8">
        <header className="mb-3 flex items-center justify-between gap-3">
          <StatusChip status={post.roadmapStatus} className="text-sm" />
          <RequestActions post={post} workspaceSlug={workspaceSlug} />
        </header>

        <div className="mb-5">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
            {post.title}
          </h1>
          {/* Board and date live in the sidebar on desktop. */}
          <p
            className="mt-1.5 text-sm text-muted-foreground md:hidden"
            suppressHydrationWarning
          >
            {post.boardName} ·{" "}
            {relativeTime(post.publishedAt ?? post.createdAt)}
          </p>
        </div>

        {normalizedContent ? (
          showOnboardingContent ? (
            <OnboardingPostContent
              content={normalizedContent}
              className="mb-6"
            />
          ) : (
            <PostBody content={normalizedContent} className="mb-6" />
          )
        ) : null}

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

        <div className="flex items-center gap-3 text-xs text-accent">
          <UpvoteButton
            postId={post.id}
            upvotes={post.upvotes}
            hasVoted={post.hasVoted}
            className="text-xs"
          />
          <CommentCounter
            postId={post.id}
            initialCount={visibleCommentCount}
            surface="public"
            className="hover:text-foreground transition-colors"
          />
        </div>
      </article>

      <div>
        <Discussion
          key={post.id}
          postId={post.id}
          initialCount={visibleCommentCount}
          workspaceSlug={workspaceSlug}
          surface="public"
          allowComments={post.allowComments}
          initialComments={initialComments}
          initialActivity={initialActivity}
          initialCollapsedIds={initialCollapsedIds}
          hidePublicMemberIdentity={showHiddenIdentity}
          plain
        />
      </div>
    </div>
  );
}
