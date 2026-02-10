"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

type SubdomainListEmptyStateProps = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function SubdomainListEmptyState({
  title,
  description,
  children,
  className,
}: SubdomainListEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center text-muted-foreground",
        className
      )}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-2 text-xs text-accent">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
