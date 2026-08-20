"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

export default function EmptyRequests({ workspaceSlug, className = "" }: { workspaceSlug: string; className?: string }) {
  const href = `https://${workspaceSlug}.featul.com`

  return (
    <div className={cn(settingsCardShellClass, className)}>
      <div className={settingsCardInnerClass}>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="text-sm font-medium text-foreground">No requests yet</div>
          <p className="mt-1 max-w-sm text-sm text-accent">
            Your feedback board is live. Share it with users to start collecting ideas.
          </p>
          <Button variant="quiet" asChild className="mt-4 px-5">
            <a href={href} target="_blank" rel="noopener noreferrer">
              Open live board
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
