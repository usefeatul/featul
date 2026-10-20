"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

export function SubdomainListItems({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-border/60 dark:divide-white/[0.07]", className)}>{children}</div>
}
