"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@oreilla/ui/components/button"
import { cn } from "@oreilla/ui/lib/utils"
import { TrashIcon } from "@oreilla/ui/icons/trash"
import { GitMerge } from "lucide-react"

type NavItem = {
  slug: string
  title: string
}

export interface RequestNavigationProps {
  prev?: NavItem | null
  next?: NavItem | null
  prevHref?: string
  nextHref?: string
  className?: string
  showActions?: boolean
  onMergeClick?: () => void
  onDeleteClick?: () => void
}

export default function RequestNavigation({ prev, next, prevHref, nextHref, className, showActions, onMergeClick, onDeleteClick }: RequestNavigationProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="inline-flex items-center rounded-md border bg-card overflow-hidden">
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={!prevHref}
        >
          {prevHref ? (
            <Link href={prevHref} title={prev?.title ? `Previous: ${prev.title} (Z)` : "Previous (Z)"} aria-label="Previous post" aria-keyshortcuts="z">
              <span className="text-xs font-medium">Prev</span>
              <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight text-accent tabular-nums h-5">Z</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="text-xs font-medium opacity-50">Prev</span>
              <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight text-accent tabular-nums h-5">Z</span>
            </span>
          )}
        </Button>
        <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={!nextHref}
        >
          {nextHref ? (
            <Link href={nextHref} title={next?.title ? `Next: ${next.title} (X)` : "Next (X)"} aria-label="Next post" aria-keyshortcuts="x">
               <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight text-accent h-5">X</span>
              <span className="text-xs font-medium">Next</span>
            </Link>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2">
               <span className="hidden sm:inline-flex items-center justify-center rounded-sm border bg-card px-1.5 text-xs font-extralight text-accent h-5">X</span>
              <span className="text-xs font-medium opacity-50">Next</span>
            </span>
          )}
        </Button>
      </div>

      {showActions ? (
        <div className="inline-flex items-center rounded-md border bg-card overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-destructive/5"
            aria-label="Merge"
            onClick={onMergeClick}
          >
            <GitMerge className="size-3.5" />
          </Button>
          <div className="h-5 w-px bg-border" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-none border-none shadow-none hover:text-destructive hover:bg-destructive/5 focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Delete"
            onClick={onDeleteClick}
          >
            <TrashIcon className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
