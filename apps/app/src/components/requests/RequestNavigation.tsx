"use client"

import Link from "next/link"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { RequestOverflowMenu } from "./RequestOverflowMenu"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import type { RequestFlags } from "@/types/request"

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
  flags?: RequestFlags
  onFlagsChange?: (value: RequestFlags) => void
  canEditFlags?: boolean
}

export default function RequestNavigation({
  postId,
  workspaceSlug,
  prev,
  next,
  prevHref,
  nextHref,
  backHref,
  className,
  showActions,
  flags,
  onFlagsChange,
  canEditFlags,
}: RequestNavigationProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Toolbar size="sm" variant="plain">
        <Button
          asChild
          variant="nav"
          size="sm"
          className="h-8 gap-2 rounded-none border-none px-3 shadow-none hover:bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={!backHref}
        >
          {backHref ? (
            <Link href={backHref} aria-label="Back to requests">
              <ChevronLeftIcon className="size-3" />
              <span className="text-xs font-medium">Back</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <ChevronLeftIcon className="size-3.5 opacity-50" />
              <span className="text-xs font-medium opacity-50">Back</span>
            </span>
          )}
        </Button>
        <ToolbarSeparator />
        <Button
          asChild
          variant="nav"
          size="sm"
          className="h-8 gap-2 rounded-none border-none px-3 shadow-none hover:bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={!prevHref}
        >
          {prevHref ? (
            <Link
              href={prevHref}
              title={prev?.title ? `Previous: ${prev.title} (Z)` : "Previous (Z)"}
              aria-label="Previous post"
              aria-keyshortcuts="z"
            >
              <span className="text-xs font-medium">Prev</span>
              <span className="hidden h-5 items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight tabular-nums text-accent sm:inline-flex dark:bg-black">
                Z
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="text-xs font-medium opacity-50">Prev</span>
              <span className="hidden h-5 items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight tabular-nums text-accent sm:inline-flex dark:bg-black">
                Z
              </span>
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
            <Link
              href={nextHref}
              title={next?.title ? `Next: ${next.title} (X)` : "Next (X)"}
              aria-label="Next post"
              aria-keyshortcuts="x"
            >
              <span className="hidden h-5 items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight text-accent sm:inline-flex dark:bg-black">
                X
              </span>
              <span className="text-xs font-medium">Next</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="hidden h-5 items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight text-accent sm:inline-flex dark:bg-black">
                X
              </span>
              <span className="text-xs font-medium opacity-50">Next</span>
            </span>
          )}
        </Button>
      </Toolbar>

      {showActions ? (
        <RequestOverflowMenu
          postId={postId}
          workspaceSlug={workspaceSlug}
          backHref={backHref}
          flags={flags}
          onFlagsChange={onFlagsChange}
          canEditFlags={canEditFlags}
        />
      ) : null}
    </div>
  )
}
