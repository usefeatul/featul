"use client"

import React, { useState } from "react"
import { Button } from "@oreilla/ui/components/button"
import CreatePostModal from "./CreatePostModal"

export default function EmptyDomainPosts({ subdomain, slug }: { subdomain: string; slug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="p-8 text-center">
        <div className="text-md font-bold">No posts yet</div>
        <p className="mt-2 text-xs font-light text-accent">Be the first to submit an idea.</p>
        <div className="mt-4">
          <Button onClick={() => setOpen(true)} className="h-9 px-4 bg-primary hover:bg-primary/90 ring-ring/60 hover:ring-ring">
            Submit a Post
          </Button>
        </div>
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
