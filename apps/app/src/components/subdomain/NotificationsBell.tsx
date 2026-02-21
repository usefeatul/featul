"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import { Bell } from "lucide-react";
import { client } from "@featul/api/client";
import NotificationsPanel, { type NotificationItem } from "./NotificationsPanel";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@featul/ui/components/popover";

export default function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    []
  );
  const [unread, setUnread] = React.useState<number>(0);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    client.comment.mentionsCount
      .$get()
      .then(async (res) => {
        const d = (await res.json().catch(() => null)) as {
          unread?: number;
        } | null;
        if (active) setUnread(Number(d?.unread ?? 0));
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  const loadNotifications = React.useCallback(async () => {
    try {
      const res = await client.comment.mentionsList.$get({ limit: 50 });
      const d = await res.json();
      const payload = d as { notifications?: NotificationItem[] } | null;
      setNotifications(
        Array.isArray(payload?.notifications) ? payload.notifications : []
      );
    } catch {
      if (mounted.current) setNotifications([]);
    }
  }, []);

  const onOpenChange = React.useCallback(
    (v: boolean) => {
      setOpen(v);
      if (v) loadNotifications();
    },
    [loadNotifications]
  );

  const markRead = React.useCallback(async (id: string) => {
    try {
      await client.comment.mentionsMarkRead.$post({ id });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      if (mounted.current) setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }, []);

  const markAllRead = React.useCallback(async () => {
    try {
      await client.comment.mentionsMarkAllRead.$post();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      if (mounted.current) setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          suppressHydrationWarning
          type="button"
          size="xs"
          variant="nav"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-4 text-foreground opacity-100 group-hover:text-primary transition-colors" />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background  tabular-nums">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        asChild
        side="top"
        align="end"
        sideOffset={8}
        className="bg-transparent p-0 border-none shadow-none w-auto"
      >
        <NotificationsPanel
          notifications={notifications}
          markRead={markRead}
          onMarkAllRead={markAllRead}
        />
      </PopoverContent>
    </Popover>
  );
}
