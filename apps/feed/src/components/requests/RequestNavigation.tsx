"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@oreilla/ui/components/button"
import { cn } from "@oreilla/ui/lib/utils"

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
}

export default function RequestNavigation({ prev, next, prevHref, nextHref, className }: RequestNavigationProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button 
        asChild 
        variant="nav" 
        size="sm" 
        className="h-8 px-3 gap-2"
        disabled={!prevHref}
      >
        {prevHref ? (
          <Link href={prevHref} title={prev?.title ? `Previous: ${prev.title} (Z)` : "Previous (Z)"} aria-label="Previous post" aria-keyshortcuts="z">
            <span className="text-xs font-medium">Prev</span>
            <span className="hidden sm:inline-flex items-center justify-center rounded-mdborder bg-muted px-1.5 text-[10px] font-medium text-muted-foreground h-5">Z</span>
          </Link>
        ) : (
          <span aria-hidden="true" className="flex items-center gap-2">
            <span className="text-xs font-medium opacity-50">Prev</span>
            <span className="hidden sm:inline-flex items-center justify-center rounded-mdborder bg-muted px-1.5 text-[10px] font-medium text-muted-foreground/50 h-5">Z</span>
          </span>
        )}
      </Button>
      
      <Button 
        asChild 
        variant="nav" 
        size="sm" 
        className="h-8 px-3 gap-2"
        disabled={!nextHref}
      >
        {nextHref ? (
          <Link href={nextHref} title={next?.title ? `Next: ${next.title} (X)` : "Next (X)"} aria-label="Next post" aria-keyshortcuts="x">
             <span className="hidden sm:inline-flex items-center justify-center rounded-mdborder bg-muted px-1.5 text-[10px] font-medium text-muted-foreground h-5">X</span>
            <span className="text-xs font-medium">Next</span>
          </Link>
        ) : (
          <span aria-hidden="true" className="flex items-center gap-2">
             <span className="hidden sm:inline-flex items-center justify-center rounded-mdborder bg-muted px-1.5 text-[10px] font-medium text-muted-foreground/50 h-5">X</span>
            <span className="text-xs font-medium opacity-50">Next</span>
          </span>
        )}
      </Button>
    </div>
  )
}
