"use client";

import React from "react";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ROADMAP_STATUSES,
  encodeCollapsed,
  groupItemsByStatus,
  normalizeRoadmapStatus,
  type RoadmapStatus,
} from "@/lib/roadmap";
import type { RequestItemData } from "@/types/request";

type Item = RequestItemData;

const isRoadmapStatus = (value: string): value is RoadmapStatus =>
  (ROADMAP_STATUSES as readonly string[]).includes(value);

export const toRoadmapCardItem = (item: Item) => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  roadmapStatus: item.roadmapStatus,
  boardName: item.boardName,
  boardSlug: item.boardSlug,
  upvotes: item.upvotes,
  commentCount: item.commentCount,
  authorImage: item.authorImage,
  authorName: item.authorName,
  authorId: item.authorId,
  role: item.role,
  isOwner: item.isOwner,
  isFeatul: item.isFeatul,
});

export function useRoadmapBoardState({
  workspaceSlug,
  initialItems,
  initialCollapsedByStatus,
}: {
  workspaceSlug: string;
  initialItems: Item[];
  initialCollapsedByStatus?: Record<string, boolean>;
}) {
  const [items, setItems] = React.useState<Item[]>(() => initialItems);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [collapsedByStatus, setCollapsedByStatus] = React.useState<
    Record<string, boolean>
  >(() => {
    const acc: Record<string, boolean> = {};
    for (const status of ROADMAP_STATUSES) {
      acc[status] = !!initialCollapsedByStatus?.[status];
    }
    return acc;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const queryClient = useQueryClient();
  const statusCountsQueryKey = React.useMemo(
    () => ["status-counts", workspaceSlug] as const,
    [workspaceSlug],
  );

  React.useEffect(() => {
    try {
      const encoded = encodeCollapsed(collapsedByStatus);
      document.cookie = `rdmpc:${workspaceSlug}=${encoded}; path=/; max-age=31536000`;
    } catch {
      console.error("Failed to set cookie");
    }
  }, [collapsedByStatus, workspaceSlug]);

  React.useEffect(() => {
    try {
      document.body.style.cursor = activeId ? "grabbing" : "";
    } catch {
      console.error("Failed to set cursor");
    }

    return () => {
      try {
        document.body.style.cursor = "";
      } catch {
        console.error("Failed to reset cursor");
      }
    };
  }, [activeId]);

  const grouped = React.useMemo(() => groupItemsByStatus(items), [items]);
  const activeItem = React.useMemo(
    () =>
      activeId ? (items.find((item) => item.id === activeId) ?? null) : null,
    [activeId, items],
  );

  const handleDragStart = React.useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const setItemRoadmapStatus = React.useCallback(
    (itemId: string, roadmapStatus: string | null) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, roadmapStatus } : item,
        ),
      );
    },
    [],
  );

  const updateStatusCountsOptimistically = React.useCallback(
    (from: RoadmapStatus, to: RoadmapStatus) => {
      queryClient.setQueryData<Record<string, number> | undefined>(
        statusCountsQueryKey,
        (prevCounts) => {
          if (!prevCounts) return prevCounts;
          const nextCounts: Record<string, number> = { ...prevCounts };
          if (typeof nextCounts[from] === "number") {
            nextCounts[from] = Math.max(0, (nextCounts[from] || 0) - 1);
          }
          nextCounts[to] = (nextCounts[to] || 0) + 1;
          return nextCounts;
        },
      );
    },
    [queryClient, statusCountsQueryKey],
  );

  const invalidateStatusCounts = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: statusCountsQueryKey });
  }, [queryClient, statusCountsQueryKey]);

  const handleDragEnd = React.useCallback(
    async (overId?: string) => {
      const dragged = items.find((item) => item.id === activeId);
      setActiveId(null);
      if (!dragged) return;

      const target = (overId || "").toLowerCase();
      if (!isRoadmapStatus(target)) return;
      if ((dragged.roadmapStatus || "pending").toLowerCase() === target) return;

      const previousStatus = normalizeRoadmapStatus(
        dragged.roadmapStatus || "pending",
      );
      const nextStatus = normalizeRoadmapStatus(target);

      setItemRoadmapStatus(dragged.id, target);
      updateStatusCountsOptimistically(previousStatus, nextStatus);
      setSavingId(dragged.id);

      try {
        await client.board.updatePostMeta.$post({
          postId: dragged.id,
          roadmapStatus: target,
        });
        invalidateStatusCounts();
        toast.success("Status updated");
      } catch (err: unknown) {
        setItemRoadmapStatus(dragged.id, previousStatus || null);
        invalidateStatusCounts();
        const message =
          err instanceof Error ? err.message : "Failed to update status";
        toast.error(message);
      } finally {
        setSavingId(null);
      }
    },
    [
      activeId,
      invalidateStatusCounts,
      items,
      setItemRoadmapStatus,
      updateStatusCountsOptimistically,
    ],
  );

  const setColumnCollapsed = React.useCallback(
    (status: string, next: boolean) => {
      setCollapsedByStatus((prev) => ({ ...prev, [status]: next }));
    },
    [],
  );

  return {
    sensors,
    grouped,
    activeId,
    activeItem,
    savingId,
    collapsedByStatus,
    handleDragStart,
    handleDragEnd,
    setColumnCollapsed,
  };
}
