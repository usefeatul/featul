"use client"

import * as React from "react"
import { Button } from "@featul/ui/components/button"
import { IdeaIcon } from "@/components/global/icons"
import { cn } from "@featul/ui/lib/utils"
import CreatePostModal from "./CreatePostModal"
import { usePortalData } from "./PortalDataProvider"

/** Primary "Share an idea" call to action that opens the post composer. */
export function ShareIdeaButton({ className }: { className?: string }) {
  const data = usePortalData()
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button className={cn("gap-2 px-3", className)} onClick={() => setOpen(true)}>
        <IdeaIcon className="size-4" />
        Share an idea
      </Button>
      <CreatePostModal
        open={open}
        onOpenChange={setOpen}
        workspaceSlug={data.subdomain}
        boardSlug={data.subdomain}
      />
    </>
  )
}
