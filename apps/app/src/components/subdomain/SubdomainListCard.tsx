"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"
import { subdomainSurfaceClassName } from "./subdomainListItemStyles"

type SubdomainListCardProps = {
  children: ReactNode
  className?: string
}

export function SubdomainListCard({ children, className }: SubdomainListCardProps) {
  return (
    <div
      className={cn(
        "rounded-md mt-4",
        subdomainSurfaceClassName,
        className
      )}
    >
      {children}
    </div>
  )
}
