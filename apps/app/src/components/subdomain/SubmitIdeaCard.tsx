"use client"

import React, { useState } from "react"
import { Button } from "@featul/ui/components/button"
import CreatePostModal from "./CreatePostModal"
import { IdeaIcon } from "@featul/ui/icons/idea"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

export function SubmitIdeaCard({ subdomain, slug }: { subdomain: string; slug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={settingsCardShellClass}>
        <header className="flex items-center gap-2 py-2">
          <IdeaIcon className="size-4" />
          <h2 className="text-sm font-medium leading-none">Got an idea?</h2>
        </header>
        <div className={settingsCardInnerClass}>
          <Button
            onClick={() => setOpen(true)}
            className="h-9 w-full bg-primary hover:bg-primary/90 ring-ring/60 hover:ring-ring"
          >
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
