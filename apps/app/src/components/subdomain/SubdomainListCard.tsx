"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

type SubdomainListCardProps = {
  children: ReactNode
  className?: string
}

export function SubdomainListCard({ children, className }: SubdomainListCardProps) {
  return (
    <div className={cn(settingsCardShellClass, "mt-4 has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-1 has-[[data-page-empty]]:flex-col", className)}>
      <div className={cn(settingsCardInnerClass, "overflow-hidden p-0 has-[[data-page-empty]]:flex has-[[data-page-empty]]:flex-1 has-[[data-page-empty]]:flex-col")}>
        {children}
      </div>
    </div>
  )
}
