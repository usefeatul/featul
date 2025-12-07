"use client"

import React, { useState } from "react"
import { Button } from "@feedgot/ui/components/button"
import CreatePostModal from "./CreatePostModal"

export function SubmitIdeaCard({ subdomain, slug }: { subdomain: string; slug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-md border bg-card p-4">
        <div className="mb-3 text-sm font-medium">Got an idea?</div>
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
