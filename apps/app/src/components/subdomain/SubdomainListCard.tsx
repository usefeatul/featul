"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

type SubdomainListCardProps = {
  children: ReactNode
  className?: string
}

export function SubdomainListCard({ children, className }: SubdomainListCardProps) {
  return (
    <div
      className={cn(
        "rounded-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border bg-card mt-4",
        className
      )}
    >
      {children}
    </div>
  )
}
