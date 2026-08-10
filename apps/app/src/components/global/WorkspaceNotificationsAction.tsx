"use client"

import { cn } from "@featul/ui/lib/utils"
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
      className={cn(
        "h-full rounded-none border-none hover:bg-muted px-3",
        className,
      )}
    />
  )
}
