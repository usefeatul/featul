"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"
import { Bell } from "lucide-react"
import { client } from "@feedgot/api/client"
import NotificationsPanel from "./NotificationsPanel"

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

  const anchorRef = React.useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <Button ref={anchorRef} type="button" size="xs" variant="nav" className="relative" onClick={() => onOpenChange(!open)}>
        <Bell className="w-[18px] h-[18px] text-foreground opacity-60 group-hover:text-primary transition-colors" />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 rounded-md bg-muted ring-1 ring-border px-1.5 py-0.5 text-[10px] tabular-nums">
            {unread}
          </span>
        ) : null}
      </Button>
      <NotificationsPanel anchorRef={anchorRef as React.RefObject<HTMLElement>} open={open} onOpenChange={onOpenChange} notifications={notifications} markRead={markRead} />
    </>
  )
}
