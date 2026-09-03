"use client"

import { useState } from "react"
import Link from "next/link"
import { PostImageGallery } from "@/components/post/PostImageGallery"
import RequestNavigation from "./RequestNavigation"
import { useRequestNavigation } from "@/hooks/useRequestNavigation"
import { buildRequestsUrl } from "@/utils/request"
import CommentCounter from "../comments/CommentCounter"
import { UpvoteButton } from "../upvote/UpvoteButton"
import CommentList from "../comments/CommentList"
import RequestDetailSidebar from "./RequestDetailSidebar"
import type { CommentData } from "../../types/comment"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import { EditIcon } from "@featul/ui/icons/edit"
import { MergePopover } from "./MergePopover"
import { DeletePostButton } from "./DeletePostButton"
import { useIsMobile } from "@featul/ui/hooks/use-mobile"
import EditPostModal from "../subdomain/request/EditPostModal"
import type { RequestDetailData } from "@/types/request"
import { isOnboardingPost } from "@/lib/onboarding/post"
import { OnboardingPostContent } from "./OnboardingPostContent"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"
import { cn } from "@featul/ui/lib/utils"
import { MergeSubmissionSection } from "./MergeSubmission"

type RequestDetailProps = {
  post: RequestDetailData
  workspaceSlug: string
  readonly?: boolean
  initialComments?: CommentData[]
  initialCollapsedIds?: string[]
  navigation?: { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }
}

export default function RequestDetail({
  post,
  workspaceSlug,
  readonly = false,
  initialComments,
  initialCollapsedIds,
  navigation,
}: RequestDetailProps) {
  const { prevHref, nextHref, searchParams } = useRequestNavigation(workspaceSlug, navigation)
  const backHref = buildRequestsUrl(workspaceSlug, searchParams, {})
  const isMobile = useIsMobile()
  const [editOpen, setEditOpen] = useState(false)
  const canEdit = (post.role === "admin" || post.isOwner) && !readonly
  const showOnboardingContent = isOnboardingPost(post.metadata)
  const normalizedContent = showOnboardingContent
    ? post.content
    : post.content?.replace(/\n{2,}/g, "\n")
  const editButtonClassName = isMobile
    ? "absolute right-0 -top-1 h-7 w-7 p-0 text-muted-foreground"
    : "absolute right-0 -top-2 h-7 w-7 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-foreground hover:bg-muted/40"

  return (
    <section>
      <div className="grid items-start gap-4 md:grid-cols-[0.7fr_0.3fr]">
      <div className="flex min-w-0 flex-col gap-4">
      <article className={settingsCardShellClass}>
        <header className="flex flex-col gap-3 py-2">
          {isMobile ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <Button asChild variant="plain" size="xs">
                  <Link href={backHref} aria-label="Back to requests">
                    <ChevronLeftIcon className="size-3" />
                  </Link>
                </Button>
                <Toolbar size="sm">
                  <MergePopover postId={post.id} workspaceSlug={workspaceSlug} />
                  <ToolbarSeparator />
                  <DeletePostButton postId={post.id} workspaceSlug={workspaceSlug} backHref={backHref} />
                </Toolbar>
              </div>
              <h1 className="text-lg font-semibold leading-tight wrap-break-word text-foreground">
                {post.title}
              </h1>
            </>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <h1 className="min-w-0 flex-1 text-lg font-semibold leading-snug wrap-break-word text-foreground md:text-xl">
                {post.title}
              </h1>
              <RequestNavigation
                postId={post.id}
                workspaceSlug={workspaceSlug}
                prev={navigation?.prev}
                next={navigation?.next}
                prevHref={prevHref}
                nextHref={nextHref}
                backHref={backHref}
                className="shrink-0"
                showActions
              />
            </div>
          )}
        </header>

        <div className={cn(settingsCardInnerClass, "gap-5")}>
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
                <div className="prose min-w-0 wrap-break-word whitespace-pre-wrap text-sm leading-6 text-accent dark:prose-invert">
                  {normalizedContent}
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
            className="-mx-4 border-t border-border/50 px-4 pt-3"
            mergedInto={post.mergedInto}
            mergedIntoHref={
              post.mergedInto
                ? `/workspaces/${workspaceSlug}/requests/${post.mergedInto.slug}`
                : undefined
            }
            mergedSources={post.mergedSources}
            mergedCount={post.mergedCount}
            sourceHref={(slug) => `/workspaces/${workspaceSlug}/requests/${slug}`}
          />
          {isMobile ? (
            <div className="flex items-center justify-between gap-3 text-sm text-accent">
              <div className="inline-flex items-center gap-3">
                <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-sm" />
                <CommentCounter postId={post.id} initialCount={post.commentCount} surface="workspace" />
              </div>
              <Toolbar size="sm">
                <Button
                  asChild
                  variant="plain"
                  size="sm"
                  className={cn(toolbarItemClass, "h-8 gap-2 px-3")}
                  disabled={!prevHref}
                >
                  {prevHref ? (
                    <Link href={prevHref} aria-label="Previous post">
                      <ChevronLeftIcon className="size-3" />
                      <span className="text-xs font-medium">Prev</span>
                    </Link>
                  ) : (
                    <span aria-hidden="true" className="flex items-center gap-2">
                      <ChevronLeftIcon className="size-3.5 opacity-50" />
                      <span className="text-xs font-medium opacity-50">Prev</span>
                    </span>
                  )}
                </Button>
                <ToolbarSeparator />
                <Button
                  asChild
                  variant="plain"
                  size="sm"
                  className={cn(toolbarItemClass, "h-8 gap-2 px-3")}
                  disabled={!nextHref}
                >
                  {nextHref ? (
                    <Link href={nextHref} aria-label="Next post">
                      <span className="text-xs font-medium">Next</span>
                      <ChevronRightIcon className="size-3" />
                    </Link>
                  ) : (
                    <span aria-hidden="true" className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-50">Next</span>
                      <ChevronRightIcon className="size-3.5 opacity-50" />
                    </span>
                  )}
                </Button>
              </Toolbar>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 text-xs text-accent">
              <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-xs" />
              <CommentCounter postId={post.id} initialCount={post.commentCount} surface="workspace" />
            </div>
          )}
        </div>
      </article>
      <CommentList
        postId={post.id}
        initialCount={post.commentCount}
        workspaceSlug={workspaceSlug}
        surface="workspace"
        allowComments={post.allowComments}
        initialComments={initialComments}
        initialCollapsedIds={initialCollapsedIds}
      />
      </div>

      <RequestDetailSidebar post={post} workspaceSlug={workspaceSlug} readonly={readonly} />
      </div>
      {canEdit ? (
        <EditPostModal open={editOpen} onOpenChange={setEditOpen} workspaceSlug={workspaceSlug} post={post} />
      ) : null}
    </section>
  )
}
