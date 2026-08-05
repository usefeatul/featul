"use client";

import React from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ROADMAP_STATUSES,
  buildRoadmapReorderUpdates,
  encodeCollapsed,
  groupItemsByStatus,
  normalizeRoadmapStatus,
  type RoadmapStatus,
} from "@/lib/roadmap";
import type { RequestItemData } from "@/types/request";

type Item = RequestItemData;

const isRoadmapStatus = (value: string): value is RoadmapStatus =>
  (ROADMAP_STATUSES as readonly string[]).includes(value);

function flattenGrouped(grouped: Record<string, Item[]>): Item[] {
  const result: Item[] = [];
  for (const status of ROADMAP_STATUSES) {
    const column = grouped[status] || [];
    column.forEach((item, index) => {
      result.push({
        ...item,
        roadmapStatus: status,
        roadmapOrder: index,
      });
    });
  }
  return result;
}

function cloneGrouped(grouped: Record<string, Item[]>): Record<string, Item[]> {
  const next: Record<string, Item[]> = {};
  for (const status of ROADMAP_STATUSES) {
    next[status] = [...(grouped[status] || [])];
  }
  return next;
}

export const toRoadmapCardItem = (item: Item) => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  roadmapStatus: item.roadmapStatus,
  content: item.content,
  boardName: item.boardName,
  boardSlug: item.boardSlug,
  createdAt: item.createdAt,
  publishedAt: item.publishedAt,
  commentCount: item.commentCount,
  upvotes: item.upvotes,
  hasVoted: item.hasVoted,
  authorImage: item.authorImage,
  authorName: item.authorName,
  authorId: item.authorId,
  role: item.role,
  isOwner: item.isOwner,
  isFeatul: item.isFeatul,
  isPinned: item.isPinned,
  isFeatured: item.isFeatured,
  reportCount: item.reportCount,
  tags: item.tags,
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

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  React.useEffect(() => {
    const handlePostDeleted = (event: Event) => {
      const detail = (event as CustomEvent<{ postId?: string; workspaceSlug?: string }>).detail;
      if (!detail?.postId || detail.workspaceSlug !== workspaceSlug) return;
      setItems((prevItems) => prevItems.filter((item) => item.id !== detail.postId));
    };

    window.addEventListener("post:deleted", handlePostDeleted);
    return () => window.removeEventListener("post:deleted", handlePostDeleted);
  }, [workspaceSlug]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

  const invalidateStatusCounts = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: statusCountsQueryKey });
  }, [queryClient, statusCountsQueryKey]);

  const persistLayout = React.useCallback(
    async (nextGrouped: Record<string, Item[]>, previousItems: Item[]) => {
      const updates = (ROADMAP_STATUSES as readonly string[]).flatMap((status) =>
        buildRoadmapReorderUpdates(status, nextGrouped[status] || []),
      );
      if (updates.length === 0) return;

      try {
        await client.board.reorderRoadmapPosts.$post({
          workspaceSlug,
          updates,
        });
        invalidateStatusCounts();
        toast.success("Roadmap updated", {
          action: {
            label: "Undo",
            onClick: async () => {
              setItems(previousItems);
              const undoUpdates = (ROADMAP_STATUSES as readonly string[]).flatMap(
                (status) =>
                  buildRoadmapReorderUpdates(
                    status,
                    groupItemsByStatus(previousItems)[status] || [],
                  ),
              );
              try {
                await client.board.reorderRoadmapPosts.$post({
                  workspaceSlug,
                  updates: undoUpdates,
                });
                invalidateStatusCounts();
              } catch {
                toast.error("Failed to undo move");
              }
            },
          },
        });
      } catch (err: unknown) {
        setItems(previousItems);
        const message =
          err instanceof Error ? err.message : "Failed to update roadmap";
        toast.error(message);
      }
    },
    [invalidateStatusCounts, workspaceSlug],
  );

  const handleDragEnd = React.useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const activeItem = items.find((item) => item.id === String(active.id));
      if (!activeItem) return;

      const previousItems = items;
      const nextGrouped = cloneGrouped(grouped);
      const activeStatus = normalizeRoadmapStatus(activeItem.roadmapStatus);
      const overId = String(over.id);

      let targetStatus = activeStatus;
      let targetIndex = (nextGrouped[activeStatus] || []).findIndex(
        (item) => item.id === activeItem.id,
      );

      if (isRoadmapStatus(overId)) {
        targetStatus = overId;
        targetIndex = (nextGrouped[targetStatus] || []).length;
      } else {
        const overItem = items.find((item) => item.id === overId);
        if (!overItem) return;
        targetStatus = normalizeRoadmapStatus(overItem.roadmapStatus);
        targetIndex = (nextGrouped[targetStatus] || []).findIndex(
          (item) => item.id === overId,
        );
        if (targetIndex < 0) {
          targetIndex = (nextGrouped[targetStatus] || []).length;
        }
      }

      const sourceColumn = [...(nextGrouped[activeStatus] || [])];
      const sourceIndex = sourceColumn.findIndex((item) => item.id === activeItem.id);
      if (sourceIndex < 0) return;

      if (activeStatus === targetStatus) {
        if (sourceIndex === targetIndex) return;
        nextGrouped[activeStatus] = arrayMove(sourceColumn, sourceIndex, targetIndex);
      } else {
        const [moving] = sourceColumn.splice(sourceIndex, 1);
        if (!moving) return;
        const destColumn = [...(nextGrouped[targetStatus] || [])];
        destColumn.splice(targetIndex, 0, {
          ...moving,
          roadmapStatus: targetStatus,
        });
        nextGrouped[activeStatus] = sourceColumn;
        nextGrouped[targetStatus] = destColumn;
      }

      const nextItems = flattenGrouped(nextGrouped);
      setItems(nextItems);
      setSavingId(activeItem.id);
      await persistLayout(nextGrouped, previousItems);
      setSavingId(null);
    },
    [grouped, items, persistLayout],
  );

  const setColumnCollapsed = React.useCallback(
    (status: string, next: boolean) => {
      setCollapsedByStatus((prev) => ({ ...prev, [status]: next }));
    },
    [],
  );

  const replaceItems = React.useCallback((nextItems: Item[]) => {
    setItems(nextItems);
  }, []);

  const appendItems = React.useCallback((nextItems: Item[]) => {
    setItems((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      for (const item of nextItems) {
        if (!existingIds.has(item.id)) merged.push(item);
      }
      return merged;
    });
  }, []);

  return {
    sensors,
    items,
    grouped,
    activeId,
    activeItem,
    savingId,
    collapsedByStatus,
    handleDragStart,
    handleDragEnd,
    setColumnCollapsed,
    replaceItems,
    appendItems,
  };
}
