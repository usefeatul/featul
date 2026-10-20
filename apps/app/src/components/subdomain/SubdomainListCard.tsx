"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

/** Flat list surface: rows separated by hairline dividers, no card frame. */
export function SubdomainListCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-border/60 has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-1 has-[[data-page-empty]]:flex-col dark:border-white/[0.07]",
        className,
      )}
    >
      {children}
    </div>
  )
}
