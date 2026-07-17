"use client"

import React, { useState } from "react"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import CreatePostModal from "./CreatePostModal"
import { IdeaIcon } from "@featul/ui/icons/idea"
import { subdomainSurfaceClassName } from "./subdomainListItemStyles"

export function SubmitIdeaCard({ subdomain, slug }: { subdomain: string; slug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={cn("rounded-md p-4", subdomainSurfaceClassName)}>
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
