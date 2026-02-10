"use client"

import React, { useState } from "react"
import { Button } from "@featul/ui/components/button"
import CreatePostModal from "./CreatePostModal"
import { SubdomainListEmptyState } from "./SubdomainListEmptyState"

export default function EmptyDomainPosts({ subdomain, slug }: { subdomain: string; slug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SubdomainListEmptyState
        title="No posts yet"
        description="Be the first to submit an idea."
      >
        <Button
          onClick={() => setOpen(true)}
          className="h-9 px-4 bg-primary hover:bg-primary/90 ring-ring/60 hover:ring-ring"
        >
          Submit a Post
        </Button>
      </SubdomainListEmptyState>
      <CreatePostModal
        open={open}
        onOpenChange={setOpen}
        workspaceSlug={subdomain}
        boardSlug={slug}
      />
    </>
  )
}
