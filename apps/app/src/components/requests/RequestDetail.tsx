"use client";

import { useEffect, useState } from "react";
import { PostImageGallery } from "@/components/post/PostImageGallery";
import Header from "./header";
import Navigator, { type RequestNavigatorPage } from "./navigator";
import { useRequestPanel } from "@/hooks/useRequestPanel";
import { useRequestNavigation } from "@/hooks/useRequestNavigation";
import { buildRequestsUrl } from "@/utils/request";
import { UpvoteButton } from "../upvote/UpvoteButton";
import CommentList from "../comments/CommentList";
import Properties from "./properties";
import type { CommentData } from "../../types/comment";
import { Button } from "@featul/ui/components/button";
import { EditIcon } from "@featul/ui/icons/edit";
import { useIsMobile } from "@featul/ui/hooks/use-mobile";
import EditPostModal from "../subdomain/request/EditPostModal";
import type { RequestDetailData } from "@/types/request";
import { isOnboardingPost } from "@/lib/onboarding/post";
import { OnboardingPostContent } from "./OnboardingPostContent";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar";
import { getDisplayUser, getInitials } from "@/utils/user";
import { relativeTime } from "@/lib/time";
import RoleBadge from "../global/RoleBadge";
import { MergeSubmissionSection } from "./MergeSubmission";
import { Linkify } from "@/components/post/linkify";
import { cn } from "@featul/ui/lib/utils";
import { usePanelShortcut } from "@/hooks/shortcut";

type RequestDetailProps = {
  post: RequestDetailData;
  workspaceSlug: string;
  initialPanelOpen?: boolean;
  initialPanelWidth?: number;
  initialNavigatorPage?: RequestNavigatorPage;
  readonly?: boolean;
  initialComments?: CommentData[];
  initialCollapsedIds?: string[];
  navigation?: {
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
  };
};

export default function RequestDetail({
  post,
  workspaceSlug,
  readonly = false,
  initialPanelOpen = false,
  initialPanelWidth,
  initialNavigatorPage,
  initialComments,
  initialCollapsedIds,
  navigation,
}: RequestDetailProps) {
  const { prevHref, nextHref, searchParams } = useRequestNavigation(
    workspaceSlug,
    navigation,
  );
  const backHref = buildRequestsUrl(workspaceSlug, searchParams, {});
  const isMobile = useIsMobile();
  const [listOpen, toggleList] = useRequestPanel(initialPanelOpen);
  usePanelShortcut(() => toggleList(!listOpen));
  useEffect(() => {
    document.getElementById("request-detail-scroll")?.scrollTo({ top: 0 });
  }, [post.id]);
  const [editOpen, setEditOpen] = useState(false);
  const canEdit = (post.role === "admin" || post.isOwner) && !readonly;
  const author = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined,
  );
  const showOnboardingContent = isOnboardingPost(post.metadata);
  const normalizedContent = showOnboardingContent
    ? post.content
    : post.content?.replace(/\n{2,}/g, "\n");
  const editButtonClassName = isMobile
    ? "absolute right-0 -top-1 h-7 w-7 p-0 text-muted-foreground"
    : "absolute right-0 -top-2 h-7 w-7 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-foreground hover:bg-muted/40";

  return (
    <section
      data-request-detail
      className={cn(
        "relative -mx-4 flex h-[calc(100dvh-var(--workspace-mobile-nav-height))] min-w-0 overflow-hidden sm:-mx-8 lg:-mx-12 lg:h-dvh xl:-mx-16",
        listOpen && "lg:gap-[2px] lg:bg-muted/45 dark:lg:bg-black/25",
      )}
    >
      <Navigator
        workspaceSlug={workspaceSlug}
        postId={post.id}
        open={listOpen}
        onClose={() => toggleList(false)}
        initialWidth={initialPanelWidth}
        initialPage={initialNavigatorPage}
      />
      <div
        id="request-detail-scroll"
        className={cn(
          "scrollbar-hide min-w-0 flex-1 overflow-y-auto overscroll-contain bg-background",
          listOpen && "lg:border-l lg:border-border/60 dark:lg:border-white/10",
        )}
      >
        <Header
          title={post.title}
          postId={post.id}
          workspaceSlug={workspaceSlug}
          backHref={backHref}
          prevHref={prevHref}
          nextHref={nextHref}
          readonly={readonly}
          onOpenList={listOpen ? undefined : () => toggleList(true)}
        />
        <div className="px-4 sm:px-8">
          <div className="mx-auto w-full max-w-[720px] pb-10 pt-5 sm:pt-7 lg:pt-8">
            <div className="flex min-w-0 flex-col gap-4">
              <article className="min-w-0">
                <header className="space-y-4">
                  <h1 className="text-xl font-semibold leading-snug tracking-tight wrap-break-word text-foreground sm:text-2xl">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="relative size-8 overflow-visible">
                      <AvatarImage
                        src={author.image || undefined}
                        alt={author.name}
                      />
                      <AvatarFallback>
                        {getInitials(author.name)}
                      </AvatarFallback>
                      <RoleBadge
                        role={post.role}
                        isOwner={post.isOwner}
                        isFeatul={post.isFeatul}
                      />
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {author.name}
                      </p>
                      <time
                        dateTime={post.publishedAt ?? post.createdAt}
                        className="text-xs text-accent"
                      >
                        {relativeTime(post.publishedAt ?? post.createdAt)}
                      </time>
                    </div>
                  </div>
                </header>

                <div className="space-y-5 pt-5 pb-2">
                  <div className="relative group space-y-5">
                    {canEdit ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className={editButtonClassName}
                        onClick={() => setEditOpen(true)}
                        aria-label="Edit post"
                      >
                        <EditIcon className="size-3.5" />
                      </Button>
                    ) : null}
                    {normalizedContent ? (
                      showOnboardingContent ? (
                        <OnboardingPostContent content={normalizedContent} />
                      ) : (
                        <div className="prose min-w-0 wrap-break-word whitespace-pre-wrap text-sm leading-7 text-foreground/85 dark:prose-invert">
                          <Linkify content={normalizedContent} />
                        </div>
                      )
                    ) : null}
                    <PostImageGallery
                      image={post.image}
                      metadata={post.metadata}
                      alt={post.title}
                      className="mt-3"
                    />
                  </div>
                  <MergeSubmissionSection
                    mergedInto={post.mergedInto}
                    mergedIntoHref={
                      post.mergedInto
                        ? `/workspaces/${workspaceSlug}/requests/${post.mergedInto.slug}`
                        : undefined
                    }
                    mergedSources={post.mergedSources}
                    mergedCount={post.mergedCount}
                    sourceHref={(slug) =>
                      `/workspaces/${workspaceSlug}/requests/${slug}`
                    }
                  />
                  <div className="pt-1">
                    <Properties
                      key={post.id}
                      post={post}
                      workspaceSlug={workspaceSlug}
                      readonly={readonly}
                    />
                  </div>
                  <div className="flex justify-end">
                    <UpvoteButton
                      postId={post.id}
                      upvotes={post.upvotes}
                      hasVoted={post.hasVoted}
                      className="h-8 rounded-md border border-border/50 bg-muted px-2.5 hover:bg-muted/80 dark:border-white/[0.08] dark:bg-[#242424] dark:hover:bg-[#2c2c2c]"
                    />
                  </div>
                </div>
              </article>
              <CommentList
                plain
                postId={post.id}
                initialCount={post.commentCount}
                workspaceSlug={workspaceSlug}
                surface="workspace"
                allowComments={post.allowComments}
                initialComments={initialComments}
                initialCollapsedIds={initialCollapsedIds}
              />
            </div>
          </div>
        </div>
      </div>
      {canEdit ? (
        <EditPostModal
          open={editOpen}
          onOpenChange={setEditOpen}
          workspaceSlug={workspaceSlug}
          post={post}
        />
      ) : null}
    </section>
  );
}
