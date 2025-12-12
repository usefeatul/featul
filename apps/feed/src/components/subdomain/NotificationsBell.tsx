"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"
import { Bell } from "lucide-react"
import { client } from "@oreilla/api/client"
import NotificationsPanel from "./NotificationsPanel"
import { Popover, PopoverTrigger, PopoverContent } from "@oreilla/ui/components/popover"

export default function NotificationsBell() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unread, setUnread] = React.useState<number>(0)

  React.useEffect(() => {
    let active = true
    client.comment.mentionsCount
      .$get()
      .then(async (res) => {
        const d = await res.json().catch(() => ({}))
        if (active) setUnread(Number((d as any)?.unread || 0))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const loadNotifications = React.useCallback(async () => {
    try {
      const res = await client.comment.mentionsList.$get({ limit: 50 })
      const d = await res.json()
      setNotifications((d as any)?.notifications || [])
    } catch {}
  }, [])

  const onOpenChange = React.useCallback(
    (v: boolean) => {
      setOpen(v)
      if (v) loadNotifications()
    },
    [loadNotifications]
  )

  const markRead = React.useCallback(async (id: string) => {
    try {
      await client.comment.mentionsMarkRead.$post({ id })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      setUnread((u) => Math.max(0, u - 1))
    } catch {}
  }, [])

  const markAllRead = React.useCallback(async () => {
    try {
      await client.comment.mentionsMarkAllRead.$post()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnread(0)
    } catch {}
  }, [])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button suppressHydrationWarning type="button" size="xs" variant="nav" className="relative" aria-label="Notifications">
          <Bell className="w-[18px] h-[18px] text-foreground opacity-60 group-hover:text-primary transition-colors" />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 rounded-md bg-muted ring-1 ring-border px-1.5 py-0.5 text-[10px] tabular-nums">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent asChild side="top" align="end" sideOffset={8} className="bg-transparent p-0 border-none shadow-none w-auto">
        <NotificationsPanel notifications={notifications} markRead={markRead} onMarkAllRead={markAllRead} />
      </PopoverContent>
    </Popover>
  )
}
