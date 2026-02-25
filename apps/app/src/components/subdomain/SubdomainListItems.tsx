"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

type SubdomainListItemsProps = {
  children: ReactNode
  className?: string
}

export function SubdomainListItems({ children, className }: SubdomainListItemsProps) {
  return <div className={cn("divide-y divide-border/60", className)}>{children}</div>
}
