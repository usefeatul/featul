"use client"

import Link from "next/link"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { MergePopover } from "./MergePopover"
import { DeletePostButton } from "./DeletePostButton"
import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar"

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
}

const navButtonClass = cn(toolbarItemClass, "h-8 gap-2 px-3")
const shortcutClass =
  "hidden sm:inline-flex h-5 items-center justify-center rounded-sm border border-border bg-card px-1.5 text-xs font-extralight tabular-nums text-accent dark:border-white/10 dark:bg-black"

export default function RequestNavigation({ postId, workspaceSlug, prev, next, prevHref, nextHref, backHref, className, showActions }: RequestNavigationProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Toolbar size="sm">
        <Button
          asChild
          variant="plain"
          size="sm"
          className={navButtonClass}
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
        <ToolbarSeparator />
        <Button
          asChild
          variant="plain"
          size="sm"
          className={navButtonClass}
          disabled={!prevHref}
        >
          {prevHref ? (
            <Link href={prevHref} title={prev?.title ? `Previous: ${prev.title} (Z)` : "Previous (Z)"} aria-label="Previous post" aria-keyshortcuts="z">
              <span className="text-xs font-medium">Prev</span>
              <span className={shortcutClass}>Z</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="text-xs font-medium opacity-50">Prev</span>
              <span className={shortcutClass}>Z</span>
            </span>
          )}
        </Button>
        <ToolbarSeparator />
        <Button
          asChild
          variant="plain"
          size="sm"
          className={navButtonClass}
          disabled={!nextHref}
        >
          {nextHref ? (
            <Link href={nextHref} title={next?.title ? `Next: ${next.title} (X)` : "Next (X)"} aria-label="Next post" aria-keyshortcuts="x">
              <span className={shortcutClass}>X</span>
              <span className="text-xs font-medium">Next</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className={shortcutClass}>X</span>
              <span className="text-xs font-medium opacity-50">Next</span>
            </span>
          )}
        </Button>
      </Toolbar>

      {showActions ? (
        <Toolbar size="sm">
          <MergePopover postId={postId} workspaceSlug={workspaceSlug} />
          <ToolbarSeparator />
          <DeletePostButton postId={postId} workspaceSlug={workspaceSlug} backHref={backHref} />
        </Toolbar>
      ) : null}
    </div>
  )
}
