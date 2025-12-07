"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"
import { LoaderIcon } from "@feedgot/ui/icons/loader"
import { ImageIcon } from "lucide-react"
import { toast } from "sonner"

export interface PostFooterProps {
  isPending: boolean
  disabled: boolean
}

export function PostFooter({ isPending, disabled }: PostFooterProps) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 bg-muted dark:bg-black/50">
      <Button
        type="button"
        variant="nav"
        size="icon"
        className="text-muted-foreground hover:text-foreground rounded-md hover:bg-background"
        onClick={() => toast.info("Image upload coming soon!")}
      >
        <ImageIcon className="size-6" />
      </Button>

      <Button
        type="submit"
        variant="default"
        disabled={disabled}
        className="bg-primary text-primary-foreground hover:bg-primary/90  px-6"
      >
        {isPending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Creating..." : "Create"}
      </Button>
    </div>
  )
}
