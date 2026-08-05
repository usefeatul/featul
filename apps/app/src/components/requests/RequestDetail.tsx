"use client"

import { useState } from "react"
import Link from "next/link"
import ContentImage from "@/components/global/ContentImage"
import RequestNavigation from "./RequestNavigation"
import { useRequestNavigation } from "@/hooks/useRequestNavigation"
import { useRequestDetailMeta } from "@/hooks/useRequestDetailMeta"
import { buildRequestsUrl } from "@/utils/request"
import CommentCounter from "../comments/CommentCounter"
import { UpvoteButton } from "../upvote/UpvoteButton"
import CommentList from "../comments/CommentList"
import RequestDetailSidebar, { RequestAuthorHeader } from "./RequestDetailSidebar"
import RequestProperties from "./RequestProperties"
import { RequestOverflowMenu } from "./RequestOverflowMenu"
import type { CommentData } from "../../types/comment"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import { EditIcon } from "@featul/ui/icons/edit"
import { ListFilterIcon } from "@featul/ui/icons/list-filter"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@featul/ui/components/sheet"
import { useIsMobile } from "@featul/ui/hooks/use-mobile"
import EditPostModal from "../subdomain/request-detail/EditPostModal"
import type { RequestDetailData } from "@/types/request"
import StatusIcon from "./StatusIcon"
import StatusPicker from "./meta/StatusPicker"
import { statusLabel } from "@/lib/roadmap"
import { ReportIndicator } from "./ReportIndicator"

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
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const { meta, setMeta, board, setBoard, tags, setTags } = useRequestDetailMeta(post)
  const canEdit = (post.role === "admin" || post.isOwner) && !readonly
  const canEditMeta = !readonly
  const normalizedContent = post.content?.replace(/\n{2,}/g, "\n")
  const editButtonClassName = isMobile
    ? "absolute right-0 -top-1 h-7 w-7 p-0 text-muted-foreground"
    : "absolute right-0 -top-2 h-7 w-7 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-foreground hover:bg-muted/40"

  const engagement = (
    <div className="inline-flex items-center gap-3 text-sm text-accent">
      <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-sm" />
      <CommentCounter postId={post.id} initialCount={post.commentCount} surface="workspace" />
      <ReportIndicator count={post.reportCount || 0} />
    </div>
  )

  const statusControl = canEditMeta ? (
    <StatusPicker
      postId={post.id}
      value={meta.roadmapStatus}
      onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))}
    />
  ) : (
    <div className="inline-flex items-center gap-2">
      <StatusIcon status={meta.roadmapStatus || undefined} className="size-5 text-foreground/80" />
      <span className="text-sm text-accent">
        {statusLabel(String(meta.roadmapStatus || "pending"))}
      </span>
    </div>
  )

  const mergeBanner =
    post.duplicateOfId && post.mergedInto ? (
      <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
        <StatusIcon status={post.mergedInto.roadmapStatus || "pending"} className="size-4 shrink-0" />
        <span className="text-accent">Merged into</span>
        <Link
          href={`/workspaces/${workspaceSlug}/requests/${post.mergedInto.slug}`}
          className="font-medium text-foreground hover:underline"
        >
          {post.mergedInto.title}
        </Link>
        {post.mergedInto.boardName ? (
          <span className="text-accent">({post.mergedInto.boardName})</span>
        ) : null}
      </div>
    ) : null

  return (
    <section>
      <div className="overflow-hidden rounded-sm border border-border bg-card ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:bg-black/40 dark:ring-offset-black">
        <div className="grid items-start gap-0 md:grid-cols-[0.7fr_0.3fr]">
          <article className="relative min-w-0 px-4 py-4 md:px-6 md:py-5">
            <div aria-hidden className="absolute right-0 top-0 hidden h-full w-px bg-border/50 md:block" />
            <header className="space-y-3 pb-4">
              {isMobile ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Button asChild variant="nav" size="xs">
                      <Link href={backHref} aria-label="Back to requests">
                        <ChevronLeftIcon className="size-3" />
                      </Link>
                    </Button>
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="nav"
                        size="xs"
                        className="gap-1.5"
                        onClick={() => setPropertiesOpen(true)}
                      >
                        <ListFilterIcon className="size-3.5" />
                        <span className="text-xs">Properties</span>
                      </Button>
                      <RequestOverflowMenu
                        postId={post.id}
                        workspaceSlug={workspaceSlug}
                        backHref={backHref}
                      />
                    </div>
                  </div>
                  <div>{statusControl}</div>
                  <h1 className="text-lg font-semibold leading-tight wrap-break-word text-foreground">
                    {post.title}
                  </h1>
                  {engagement}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>{statusControl}</div>
                      <h1 className="text-lg font-semibold leading-snug wrap-break-word text-foreground md:text-xl">
                        {post.title}
                      </h1>
                      {engagement}
                    </div>
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
                </div>
              )}
            </header>

            <div className="space-y-5 pt-2">
              {mergeBanner}
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
                  <div className="prose min-w-0 text-sm leading-6 wrap-break-word whitespace-pre-wrap text-accent dark:prose-invert">
                    {normalizedContent}
                  </div>
                ) : null}
                {post.image ? (
                  <div className="flex justify-start">
                    <ContentImage url={post.image} alt={post.title} className="h-40 w-auto max-w-full rounded-md" />
                  </div>
                ) : null}
              </div>

              {isMobile ? (
                <Toolbar size="sm" variant="plain" className="w-fit">
                  <Button
                    asChild
                    variant="nav"
                    size="sm"
                    className="h-8 gap-2 rounded-none border-none px-3 shadow-none hover:bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    variant="nav"
                    size="sm"
                    className="h-8 gap-2 rounded-none border-none px-3 shadow-none hover:bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
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
              ) : null}

              <div className="mt-2 pt-4">
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
            </div>
          </article>

          <RequestDetailSidebar
            post={post}
            workspaceSlug={workspaceSlug}
            readonly={readonly}
            meta={meta}
            onMetaChange={(value) => setMeta((m) => ({ ...m, ...value }))}
            board={board}
            onBoardChange={setBoard}
            tags={tags}
            onTagsChange={setTags}
          />
        </div>
      </div>

      <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl p-0">
          <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
            <SheetTitle>Properties</SheetTitle>
            <SheetDescription>Update board, status, flags, and tags for this request.</SheetDescription>
          </SheetHeader>
          <div className="px-4 py-4">
            <RequestAuthorHeader post={post} />
            <RequestProperties
              post={post}
              workspaceSlug={workspaceSlug}
              canEdit={canEditMeta}
              meta={meta}
              onMetaChange={(value) => setMeta((m) => ({ ...m, ...value }))}
              board={board}
              onBoardChange={setBoard}
              tags={tags}
              onTagsChange={setTags}
            />
          </div>
        </SheetContent>
      </Sheet>

      {canEdit ? (
        <EditPostModal open={editOpen} onOpenChange={setEditOpen} workspaceSlug={workspaceSlug} post={post} />
      ) : null}
    </section>
  )
}
