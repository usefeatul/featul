"use client"

import Link from "next/link"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@featul/ui/components/hover-card"
import { cn } from "@featul/ui/lib/utils"
import StatusIcon from "./StatusIcon"
import { normalizeRoadmapStatus } from "@/lib/roadmap"
import {
  buildRoadmapPreview,
  formatRoadmapCardDate,
  getRoadmapStatusTone,
} from "@/components/roadmap/card"
import RoadmapRequestItemFooter from "@/components/roadmap/RoadmapRequestItemFooter"
import { randomAvatarUrl } from "@/utils/avatar"
import type { MergedRequestSummary } from "@/types/request"

export type MergePostSummary = MergedRequestSummary

function MergePostPreview({
  href,
  post,
  hidePublicMemberIdentity,
}: {
  href: string
  post: MergePostSummary
  hidePublicMemberIdentity?: boolean
}) {
  const hideIdentity = Boolean(
    hidePublicMemberIdentity && post.authorName && post.authorName !== "Guest",
  )
  const authorLabel = hideIdentity
    ? "Member"
    : post.authorName?.trim() || "Guest"
  const authorSeed = post.authorId || post.id || post.slug
  const avatarSrc = hideIdentity
    ? randomAvatarUrl(authorSeed, "avataaars")
    : post.authorImage || randomAvatarUrl(authorSeed, "avataaars")
  const boardLabel = post.boardName?.trim() || "Board"
  const preview = buildRoadmapPreview(post.content, post.boardName)
  const dateLabel =
    formatRoadmapCardDate(post.publishedAt || post.createdAt || post.mergedAt) ||
    "No date"
  const tone = getRoadmapStatusTone(post.roadmapStatus)

  return (
    <div className="relative flex h-full min-h-[152px] w-full min-w-0 flex-col overflow-hidden rounded-[inherit]">
      <div className="min-h-0 flex-1 px-3.5 pb-3 pt-3.5">
        <Link
          href={href}
          className="line-clamp-2 block min-h-10 text-sm font-medium leading-5 text-foreground hover:text-primary"
        >
          {post.title || "Merged request"}
        </Link>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-accent/90">
          {preview}
        </p>
      </div>
      <RoadmapRequestItemFooter
        toneFooterClass={tone.footer}
        authorLabel={authorLabel}
        avatarSrc={avatarSrc}
        boardLabel={boardLabel}
        dateLabel={dateLabel}
        commentCount={Math.max(0, Number(post.commentCount || 0))}
        postId={post.id}
        upvotes={Number(post.upvotes || 0)}
      />
    </div>
  )
}

function MergePostChip({
  href,
  post,
  hidePublicMemberIdentity,
}: {
  href: string
  post: MergePostSummary
  hidePublicMemberIdentity?: boolean
}) {
  const status = normalizeRoadmapStatus(post.roadmapStatus)
  const title = post.title || "Merged request"

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={href}
          className="inline-flex h-6 max-w-[20rem] items-center outline-hidden"
          aria-label={title}
        >
          <OverlayChip
            className="max-w-full"
            innerClassName="h-6 min-h-6 w-full max-w-full justify-start gap-1 px-1.5 text-[11px] font-medium text-foreground"
          >
            <StatusIcon status={status} className="size-3 shrink-0" />
            <span className="min-w-0 truncate">{title}</span>
          </OverlayChip>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent innerClassName="flex min-h-[152px] flex-col p-0">
        <MergePostPreview
          href={href}
          post={post}
          hidePublicMemberIdentity={hidePublicMemberIdentity}
        />
      </HoverCardContent>
    </HoverCard>
  )
}

function MergeChipRow({
  label,
  posts,
  hrefFor,
  extraCount = 0,
  hidePublicMemberIdentity,
}: {
  label: string
  posts: MergePostSummary[]
  hrefFor: (slug: string) => string
  extraCount?: number
  hidePublicMemberIdentity?: boolean
}) {
  if (posts.length === 0 && extraCount <= 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex h-6 shrink-0 items-center text-sm font-medium leading-none text-muted-foreground">
        {label}
      </span>
      {posts.map((post) => (
        <MergePostChip
          key={post.slug}
          href={hrefFor(post.slug)}
          post={post}
          hidePublicMemberIdentity={hidePublicMemberIdentity}
        />
      ))}
      {extraCount > 0 ? (
        <span className="inline-flex h-6 items-center text-[11px] text-muted-foreground">
          +{extraCount} more
        </span>
      ) : null}
    </div>
  )
}

export function MergeSubmissionSection({
  mergedInto,
  mergedIntoHref,
  mergedSources,
  mergedCount,
  sourceHref,
  hidePublicMemberIdentity,
  className,
}: {
  mergedInto?: MergePostSummary | null
  mergedIntoHref?: string
  mergedSources?: MergePostSummary[]
  mergedCount?: number
  sourceHref: (slug: string) => string
  hidePublicMemberIdentity?: boolean
  className?: string
}) {
  const hasTarget = Boolean(mergedIntoHref && mergedInto)
  const sources = mergedSources ?? []
  const extraCount = Math.max(0, (mergedCount ?? sources.length) - sources.length)
  if (!hasTarget && sources.length === 0 && extraCount <= 0) return null

  return (
    <section className={cn("flex flex-col gap-2", className)}>
      {hasTarget && mergedInto && mergedIntoHref ? (
        <MergeChipRow
          label="Merged into"
          posts={[mergedInto]}
          hrefFor={() => mergedIntoHref}
          hidePublicMemberIdentity={hidePublicMemberIdentity}
        />
      ) : null}
      {sources.length > 0 || extraCount > 0 ? (
        <MergeChipRow
          label="Merged here"
          posts={sources}
          hrefFor={sourceHref}
          extraCount={extraCount}
          hidePublicMemberIdentity={hidePublicMemberIdentity}
        />
      ) : null}
    </section>
  )
}
