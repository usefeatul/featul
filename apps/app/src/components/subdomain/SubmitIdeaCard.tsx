"use client"

import React, { useState } from "react"
import { Button } from "@featul/ui/components/button"
import CreatePostModal from "./CreatePostModal"
import { IdeaIcon } from "@featul/ui/icons/idea"

export function SubmitIdeaCard({ subdomain, slug }: { subdomain: string; slug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border bg-card p-4">
        <div className="mb-3 text-sm font-medium flex items-center gap-2">
          <IdeaIcon className="size-5" />
          Got an idea?
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="h-9 w-full bg-primary hover:bg-primary/90 ring-ring/60 hover:ring-ring"
        >
          Submit a Post
        </Button>
      </div>
      <CreatePostModal
        open={open}
        onOpenChange={setOpen}
        workspaceSlug={subdomain}
        boardSlug={slug}
      />
    </>
  )
}
