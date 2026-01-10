 "use client"

import React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { relativeTime } from "@/lib/time"
import { motion, HTMLMotionProps } from "framer-motion"

export interface NotificationItem {
  id: string
  postSlug: string
  authorImage?: string | null
  authorName?: string | null
  isRead?: boolean
  createdAt: string
}

interface NotificationsPanelProps {
  notifications: NotificationItem[]
  markRead: (id: string) => void
  onMarkAllRead?: () => void
}

const NotificationsPanel = React.forwardRef<HTMLDivElement, NotificationsPanelProps & HTMLMotionProps<"div">>(
  ({ notifications, markRead, onMarkAllRead, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        {...props}
        className={`z-50 max-w-[90vw] max-h-[36rem] bg-card dark:bg-black overflow-y-auto rounded-md border  p-2 text-popover-foreground shadow-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black "}`}
        role="dialog"
        aria-label="Notifications"
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.2 }}
      >
        <div className="px-2.5 py-2.5 space-x-4 text-sm font-medium flex items-center justify-between">
          <span>Notifications</span>

          {onMarkAllRead && (
            <button
              type="button"
              className="text-xs rounded-md  bg-muted ring-1 ring-border px-2 py-1.5 cursor-pointer"
              onClick={onMarkAllRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-5 py-5 text-sm text-accent flex justify-center">
            No notifications
          </div>
        ) : (
          <ul className="list-none">
            {notifications.map((n) => (
              <li key={n.id} className="px-2">
                <Link
                  href={`/board/p/${n.postSlug}`}
                  className="px-2 py-1.5 flex items-center gap-2 rounded-md  hover:bg-muted dark:hover:bg-black/40"
                  onClick={() => markRead(n.id)}
                >
                  <div className="relative">
                    <Avatar className="size-7">
                      <AvatarImage src={n.authorImage ?? ""} />
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(n.authorName || "U")}
                      </AvatarFallback>
                    </Avatar>

                    {!n.isRead && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-1 ring-background" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-xs">
                      <span className="font-bold">{n.authorName || "Guest"}</span>
                      <span className="text-accent ml-1 font-medium">
                        mentioned you in feedback.
                      </span>
                    </div>
                    <div className="text-xs text-accent">
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    )
  }
)

NotificationsPanel.displayName = "NotificationsPanel"

export default NotificationsPanel
