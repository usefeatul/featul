"use client";

import React from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import RoadmapRequestItem from "@/components/roadmap/RoadmapRequestItem";
import RoadmapColumn from "@/components/roadmap/RoadmapColumn";
import RoadmapDraggable from "@/components/roadmap/RoadmapDraggable";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { ROADMAP_STATUSES, statusLabel } from "@/lib/roadmap";
import {
  toRoadmapCardItem,
  useRoadmapBoardState,
} from "@/components/roadmap/useRoadmapBoardState";
import type { RequestItemData } from "@/types/request";
import type { PostUser } from "@/types/post";

type Item = RequestItemData;

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
  const [createPostOpen, setCreatePostOpen] = React.useState(false);
  const {
    sensors,
    grouped,
    activeId,
    activeItem,
    savingId,
    collapsedByStatus,
    handleDragStart,
    handleDragEnd,
    setColumnCollapsed,
  } = useRoadmapBoardState({
    workspaceSlug,
    initialItems,
    initialCollapsedByStatus,
  });

  const openCreatePost = React.useCallback(() => {
    setCreatePostOpen(true);
  }, []);

  return (
    <section className="space-y-4 min-w-0">
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => handleDragStart(String(active.id))}
        onDragEnd={({ over }) => handleDragEnd(over?.id as string | undefined)}
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
                    onCreate={openCreatePost}
                    onToggle={(next) => setColumnCollapsed(s, next)}
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
          {activeItem ? (
            <motion.div
              className="rounded-md border border-border bg-card ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black px-3 py-3 pointer-events-none"
              initial={{ scale: 0.995, opacity: 0.97 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 32 }}
            >
              <RoadmapRequestItem
                item={toRoadmapCardItem(activeItem)}
                workspaceSlug={workspaceSlug}
              />
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
