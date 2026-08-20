"use client"

import { cn } from "@featul/ui/lib/utils"
import { toolbarItemClass } from "@featul/ui/components/toolbar"
import NotificationsBell from "@/components/subdomain/NotificationsBell"

export default function WorkspaceNotificationsAction({
  className = "",
}: {
  className?: string
}) {
  return (
    <NotificationsBell
      linkMode="workspace"
      side="bottom"
      align="end"
      variant="card"
      size="icon-sm"
      className={cn(toolbarItemClass, "px-3", className)}
    />
  )
}
