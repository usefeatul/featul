"use client"

import type { ReactNode } from "react"
import { Mascot, type MascotMood } from "@featul/ui/components/mascot"
import { cn } from "@featul/ui/lib/utils"

type SubdomainListEmptyStateProps = {
  title: string
  description?: ReactNode
  children?: ReactNode
  className?: string
  mood?: MascotMood
}

export function SubdomainListEmptyState({
  title,
  description,
  children,
  className,
  mood = "idle",
}: SubdomainListEmptyStateProps) {
  return (
    <div
      data-page-empty
      className={cn(
        "flex flex-1 flex-col items-center justify-center py-12 text-center text-muted-foreground",
        className
      )}
    >
      <Mascot size={96} mood={mood} className="mb-4" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-2 text-xs text-accent">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
