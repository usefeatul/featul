"use client"

import React from "react"
import ReactDOM from "react-dom"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@feedgot/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { AnimatePresence, motion } from "framer-motion"

interface NotificationsPanelProps {
  anchorRef: React.RefObject<HTMLElement>
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Array<any>
  markRead: (id: string) => void
  onMarkAllRead?: () => void
}

export default function NotificationsPanel({ anchorRef, open, onOpenChange, notifications, markRead, onMarkAllRead }: NotificationsPanelProps) {
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const panelRef = React.useRef<HTMLDivElement>(null)

  const updatePosition = React.useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const top = Math.round(rect.bottom + 8)
    const panelWidth = panelRef.current?.offsetWidth || 320
    let left = Math.round(rect.left - panelWidth + rect.width) // open to the left of the anchor
    if (left < 8) left = 8
    setPos({ top, left })
  }, [anchorRef])

  React.useEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [open, updatePosition])

  React.useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      const panel = panelRef.current
      const anchor = anchorRef.current
      if (!panel || !anchor) return
      const target = e.target as Node
      if (!panel.contains(target) && !anchor.contains(target)) {
        onOpenChange(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("mousedown", onDocDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, anchorRef, onOpenChange])

  const timeAgo = (iso?: string) => {
    try {
      const d = iso ? new Date(iso) : new Date()
      const diff = Date.now() - d.getTime()
      const min = Math.floor(diff / 60000)
      if (min < 1) return "just now"
      if (min < 60) return `${min}m ago`
      const hr = Math.floor(min / 60)
      if (hr < 24) return `${hr}h ago`
      const day = Math.floor(hr / 24)
      if (day < 7) return `${day}d ago`
      const wk = Math.floor(day / 7)
      return wk === 1 ? "last week" : `${wk}w ago`
    } catch {
      return ""
    }
  }

  return ReactDOM.createPortal(
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          ref={panelRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="z-50 w-[20rem] max-w-[90vw] max-h-[36rem] overflow-y-auto rounded-sm border bg-popover p-2 text-popover-foreground shadow-md"
          role="dialog"
          aria-label="Notifications"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.2 }}
       >
          <div className="px-2.5 py-2.5 text-sm font-medium flex items-center justify-between">
            <span>Notifications</span>
            {onMarkAllRead ? (
              <button type="button" className="text-xs rounded-md bg-muted ring-1 ring-border px-2 py-1 cursor-pointer" onClick={onMarkAllRead}>
                Mark all as read
              </button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <div className="px-3 py-3 text-sm text-accent">No notifications</div>
          ) : (
            <ul className="list-none">
              {notifications.map((n) => (
                <li key={n.id} className="px-2">
                  <Link
                    href={`/p/${n.postSlug}`}
                    className="px-2 py-1.5 flex items-center gap-2 rounded-md hover:bg-muted dark:hover:bg-black/40"
                    onClick={() => markRead(n.id)}
                  >
                    <div className="relative">
                      <Avatar className="size-7">
                        <AvatarImage src={n.authorImage || undefined} />
                        <AvatarFallback className="text-sm font-medium">{getInitials(n.authorName || "U")}</AvatarFallback>
                      </Avatar>
                      {!n.isRead ? (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-1 ring-background" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs">
                        <span className="font-bold ">{n.authorName || "Guest"}</span>  
                        <span className="text-accent ml-1 font-medium">mentioned you in feedback.</span>
                      </div>
                      <div className="text-xs text-accent">{timeAgo(n.createdAt)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
