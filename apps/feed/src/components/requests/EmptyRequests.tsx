"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"

export default function EmptyRequests({ workspaceSlug, className = "" }: { workspaceSlug: string; className?: string }) {
  const href = `https://${workspaceSlug}.oreilla.com`
  return (
    <div className={`flex flex-col items-center justify-center text-center min-h-[60vh] md:min-h-[70vh] py-14 ${className}`}>
      <div className="inline-flex items-center justify-center size-10 rounded-md  bg-muted border ring-1 ring-border/60 text-foreground font-mono tabular-nums">0</div>
      <h1 className="mt-4 text-xl sm:text-2xl font-semibold max-w-sm mx-auto">Ready to collect feedback!</h1>
      <p className="mt-2 text-accent text-sm sm:text-base max-w-xs mx-auto">
        Your feedback board is live. Share it with users to start collecting ideas.
      </p>
      <Button variant="quiet" asChild className="mt-6">
        <a href={href} target="_blank" rel="noopener noreferrer">Open live board</a>
      </Button>
    </div>
  )
}
