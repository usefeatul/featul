"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import NotificationsPanel, {
  type NotificationItem,
  type NotificationLinkMode,
} from "./NotificationsPanel";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@featul/ui/components/popover";
import { cn } from "@featul/ui/lib/utils";
import { COMMENT_CREATED_EVENT } from "@/lib/comment/shared";
import {
  fetchMentionsList,
  fetchMentionsUnreadCount,
  mentionsQueryKeys,
} from "@/lib/mentions/query";

type NotificationsBellProps = {
  linkMode?: NotificationLinkMode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  variant?: "nav" | "card" | "ghost" | "plain";
  size?: "xs" | "icon-sm" | "sm";
};

export default function NotificationsBell({
  linkMode = "public",
  side = "top",
  align = "end",
  className,
  variant = "nav",
  size = "xs",
}: NotificationsBellProps = {}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data: unread = 0 } = useQuery({
    queryKey: mentionsQueryKeys.count,
    queryFn: fetchMentionsUnreadCount,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });

  const { data: notifications = [], refetch: refetchList } = useQuery({
    queryKey: mentionsQueryKeys.list,
    queryFn: fetchMentionsList,
    enabled: open,
    staleTime: 0,
  });

  React.useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: mentionsQueryKeys.all });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener(COMMENT_CREATED_EVENT, refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(COMMENT_CREATED_EVENT, refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [queryClient]);

  const onOpenChange = React.useCallback(
    (v: boolean) => {
      setOpen(v);
      if (v) {
        void refetchList();
        void queryClient.invalidateQueries({
          queryKey: mentionsQueryKeys.count,
        });
      }
    },
    [queryClient, refetchList],
  );

  const markRead = React.useCallback(
    async (id: string) => {
      const previous = queryClient.getQueryData<NotificationItem[]>(
        mentionsQueryKeys.list,
      );
      const previousUnread =
        queryClient.getQueryData<number>(mentionsQueryKeys.count) ?? 0;

      queryClient.setQueryData<NotificationItem[]>(
        mentionsQueryKeys.list,
        (prev) =>
          (prev || []).map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      queryClient.setQueryData<number>(mentionsQueryKeys.count, (prev) =>
        Math.max(0, (prev ?? previousUnread) - 1),
      );

      try {
        await client.comment.mentionsMarkRead.$post({ id });
        void queryClient.invalidateQueries({
          queryKey: mentionsQueryKeys.count,
        });
      } catch {
        if (previous) {
          queryClient.setQueryData(mentionsQueryKeys.list, previous);
        }
        queryClient.setQueryData(mentionsQueryKeys.count, previousUnread);
      }
    },
    [queryClient],
  );

  const markAllRead = React.useCallback(async () => {
    const previous = queryClient.getQueryData<NotificationItem[]>(
      mentionsQueryKeys.list,
    );
    const previousUnread =
      queryClient.getQueryData<number>(mentionsQueryKeys.count) ?? 0;

    queryClient.setQueryData<NotificationItem[]>(mentionsQueryKeys.list, (prev) =>
      (prev || []).map((n) => ({ ...n, isRead: true })),
    );
    queryClient.setQueryData<number>(mentionsQueryKeys.count, 0);

    try {
      await client.comment.mentionsMarkAllRead.$post();
    } catch {
      if (previous) {
        queryClient.setQueryData(mentionsQueryKeys.list, previous);
      }
      queryClient.setQueryData(mentionsQueryKeys.count, previousUnread);
    }
  }, [queryClient]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          suppressHydrationWarning
          type="button"
          size={size}
          variant={variant}
          className={cn("relative", className)}
          aria-label="Notifications"
        >
          <Bell className="size-4 text-foreground opacity-100 group-hover:text-primary transition-colors" />
          {unread > 0 ? (
            <span className="absolute top-0.5 right-0.5 inline-flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground tabular-nums">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        unstyled
        side={side}
        align={align}
        sideOffset={8}
        className="w-auto border-0 bg-transparent p-0 shadow-none"
      >
        <NotificationsPanel
          notifications={notifications}
          markRead={markRead}
          onMarkAllRead={markAllRead}
          linkMode={linkMode}
        />
      </PopoverContent>
    </Popover>
  );
}
