"use client"

import * as React from "react"
import { Separator as BaseSeparator } from "@base-ui/react/separator"

import { cn } from "@oreilla/ui/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof BaseSeparator>) {
  return (
    <BaseSeparator
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-accent/50 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
