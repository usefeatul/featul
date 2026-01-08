"use client"

import Link from "next/link"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { MergePopover } from "./MergePopover"
import { DeletePostButton } from "./DeletePostButton"

type NavItem = {
  slug: string
  title: string
}

export interface RequestNavigationProps {
  postId: string
  workspaceSlug: string
  prev?: NavItem | null
  next?: NavItem | null
  prevHref?: string
  nextHref?: string
  backHref?: string
  className?: string
  showActions?: boolean
  onMergeClick?: () => void
}

export default function RequestNavigation({ postId, workspaceSlug, prev, next, prevHref, nextHref, backHref, className, showActions, onMergeClick }: RequestNavigationProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="inline-flex items-center rounded-sm border bg-card overflow-hidden">
        <Button 
          asChild 
          variant="nav" 
          size="sm" 
          className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card"
          disabled={!backHref}
        >
          {backHref ? (
            <Link href={backHref} aria-label="Back to requests">
              <ChevronLeftIcon className="size-3" />
              <span className="text-xs font-medium ">Back</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <ChevronLeftIcon className="size-3.5 opacity-50" />
              <span className="text-xs font-medium opacity-50 ">Back</span>
            </span>
          )}
        </Button>
        <div className="mx-0.5 h-5 w-px bg-border dark:bg-border/10" />
        <Button 
          asChild 
          variant="nav" 
          size="sm" 
          className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card"
          disabled={!prevHref}
        >
          {prevHref ? (
            <Link href={prevHref} title={prev?.title ? `Previous: ${prev.title} (Z)` : "Previous (Z)"} aria-label="Previous post" aria-keyshortcuts="z">
              <span className="text-xs font-medium">Prev</span>
              <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent tabular-nums h-5">Z</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="text-xs font-medium opacity-50">Prev</span>
              <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent tabular-nums h-5">Z</span>
            </span>
          )}
        </Button>
        <div className="mx-0.5 h-5 w-px bg-border dark:bg-border/10" />
        <Button 
          asChild 
          variant="nav" 
          size="sm" 
          className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card "
          disabled={!nextHref}
        >
          {nextHref ? (
            <Link href={nextHref} title={next?.title ? `Next: ${next.title} (X)` : "Next (X)"} aria-label="Next post" aria-keyshortcuts="x">
               <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent h-5">X</span>
              <span className="text-xs font-medium">Next</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
               <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card dark:bg-black px-1.5 text-xs font-extralight text-accent h-5">X</span>
              <span className="text-xs font-medium opacity-50">Next</span>
            </span>
          )}
        </Button>
      </div>

      {showActions ? (
        <div className="inline-flex items-center rounded-sm border bg-card overflow-hidden">
          <MergePopover postId={postId} workspaceSlug={workspaceSlug} />
          <div className="h-5 w-px bg-border" />
          <DeletePostButton postId={postId} workspaceSlug={workspaceSlug} backHref={backHref} />
        </div>
      ) : null}
    </div>
  )
}
