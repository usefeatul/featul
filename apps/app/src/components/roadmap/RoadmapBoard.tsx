"use client";

import React from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import RoadmapRequestItem from "@/components/roadmap/RoadmapRequestItem";
import { useQueryClient } from "@tanstack/react-query";
import RoadmapColumn from "@/components/roadmap/RoadmapColumn";
import RoadmapDraggable from "@/components/roadmap/RoadmapDraggable";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import {
  ROADMAP_STATUSES,
  statusLabel,
  groupItemsByStatus,
  encodeCollapsed,
  normalizeRoadmapStatus,
  type RoadmapStatus,
} from "@/lib/roadmap";
import type { RequestItemData } from "@/types/request";
import type { PostUser } from "@/types/post";

type Item = RequestItemData;

const isRoadmapStatus = (value: string): value is RoadmapStatus =>
  (ROADMAP_STATUSES as readonly string[]).includes(value);

const toRoadmapCardItem = (item: Item) => ({
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

export default function RoadmapBoard({
  workspaceSlug,
  items: initialItems,
  currentUser,
  initialCollapsedByStatus,
}: {
  workspaceSlug: string;
  items: Item[];
  currentUser?: PostUser;
  initialCollapsedByStatus?: Record<string, boolean>;
}) {
  const [items, setItems] = React.useState<Item[]>(() => initialItems);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [createPostOpen, setCreatePostOpen] = React.useState(false);
  const [collapsedByStatus, setCollapsedByStatus] = React.useState<
    Record<string, boolean>
  >(() => {
    const acc: Record<string, boolean> = {};
    for (const s of ROADMAP_STATUSES) acc[s] = !!initialCollapsedByStatus?.[s];
    return acc;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const queryClient = useQueryClient();

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
      if (activeId) {
        document.body.style.cursor = "grabbing";
      } else {
        document.body.style.cursor = "";
      }
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

  const handleDragStart = (id: string) => {
    setActiveId(id);
  };

  const onDragEnd = async (overId?: string) => {
    const dragged = items.find((i) => i.id === activeId);
    setActiveId(null);
    if (!dragged) return;
    const target = (overId || "").toLowerCase();
    if (!isRoadmapStatus(target)) return;
    if ((dragged.roadmapStatus || "pending").toLowerCase() === target) return;
    const prev = normalizeRoadmapStatus(dragged.roadmapStatus || "pending");
    const next = normalizeRoadmapStatus(target);
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.id === dragged.id ? { ...i, roadmapStatus: target } : i,
      ),
    );
    queryClient.setQueryData<Record<string, number> | undefined>(
      ["status-counts", workspaceSlug],
      (prevCounts) => {
        if (!prevCounts) return prevCounts;
        const copy: Record<string, number> = { ...prevCounts };
        if (typeof copy[prev] === "number")
          copy[prev] = Math.max(0, (copy[prev] || 0) - 1);
        copy[next] = (copy[next] || 0) + 1;
        return copy;
      },
    );
    setSavingId(dragged.id);
    try {
      await client.board.updatePostMeta.$post({
        postId: dragged.id,
        roadmapStatus: target,
      });
      queryClient.invalidateQueries({
        queryKey: ["status-counts", workspaceSlug],
      });
      toast.success("Status updated");
    } catch (err: unknown) {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === dragged.id ? { ...i, roadmapStatus: prev || null } : i,
        ),
      );
      queryClient.invalidateQueries({
        queryKey: ["status-counts", workspaceSlug],
      });
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-4 min-w-0">
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => handleDragStart(String(active.id))}
        onDragEnd={({ over }) => onDragEnd(over?.id as string | undefined)}
      >
        <div className="w-full min-w-0 overflow-x-auto pb-2 [scrollbar-width:thin]">
          <div className="flex min-w-full flex-col gap-4 md:min-w-max md:flex-row md:items-start">
            {(ROADMAP_STATUSES as readonly string[]).map((s) => {
              const itemsForStatus = grouped[s];
              return (
                <div
                  key={s}
                  className={`w-full md:flex-none ${collapsedByStatus[s] ? "md:w-20" : "md:w-[308px]"}`}
                >
                  <RoadmapColumn
                    id={s}
                    label={statusLabel(s)}
                    count={itemsForStatus?.length ?? 0}
                    collapsed={!!collapsedByStatus[s]}
                    onCreate={() => setCreatePostOpen(true)}
                    onToggle={(next) =>
                      setCollapsedByStatus((prev) => ({ ...prev, [s]: next }))
                    }
                  >
                    <AnimatePresence initial={false}>
                      {(itemsForStatus || []).map((it) => {
                        const isSaving = savingId === it.id;
                        return (
                          <RoadmapDraggable
                            key={it.id}
                            id={it.id}
                            isDragging={activeId === it.id}
                            className={isSaving ? "border-primary/60" : ""}
                          >
                            <RoadmapRequestItem
                              item={toRoadmapCardItem(it)}
                              workspaceSlug={workspaceSlug}
                            />
                          </RoadmapDraggable>
                        );
                      })}
                    </AnimatePresence>
                  </RoadmapColumn>
                </div>
              );
            })}
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <motion.div
              className="rounded-md border border-border bg-card ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black px-3 py-3 pointer-events-none"
              initial={{ scale: 0.995, opacity: 0.97 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 32 }}
            >
              {(() => {
                const it = items.find((i) => i.id === activeId);
                if (!it) return null;
                return (
                  <RoadmapRequestItem
                    item={toRoadmapCardItem(it)}
                    workspaceSlug={workspaceSlug}
                  />
                );
              })()}
            </motion.div>
          ) : null}
        </DragOverlay>
        <CreatePostModal
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          workspaceSlug={workspaceSlug}
          user={currentUser}
        />
      </DndContext>
    </section>
  );
}
