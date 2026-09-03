"use client";

import React from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import RoadmapRequestItem from "@/components/roadmap/RoadmapRequestItem";
import RoadmapColumn, {
  ROADMAP_COLUMN_WIDTH_TRANSITION_CLASS,
  roadmapColumnWidthClass,
} from "@/components/roadmap/RoadmapColumn";
import RoadmapDraggable from "@/components/roadmap/RoadmapDraggable";
import RoadmapKeyboardShortcuts from "@/components/roadmap/RoadmapKeyboardShortcuts";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { RequestItemContextMenu } from "@/components/requests/RequestItemContextMenu";
import { ROADMAP_STATUSES, statusLabel } from "@/lib/roadmap";
import {
  toRoadmapCardItem,
  useRoadmapBoardState,
} from "@/hooks/useRoadmapBoardState";
import { useRoadmapCanvasNavigation } from "@/hooks/useRoadmapCanvasNavigation";
import { useRoadmapFilters } from "@/hooks/useRoadmapFilters";
import type { RequestItemData } from "@/types/request";
import type { PostUser } from "@/types/post";
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

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
  const [createPostStatus, setCreatePostStatus] = React.useState("pending");
  const {
    boardScrollRef,
    setColumnRef,
    jumpToStatus,
    getCurrentStatusIndex,
  } = useRoadmapCanvasNavigation(ROADMAP_STATUSES);
  const {
    sensors,
    items,
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
  const { grouped, hasActiveFilters, totalVisible, totalItems } =
    useRoadmapFilters(items);

  const openCreatePost = React.useCallback((status = "pending") => {
    setCreatePostStatus(status);
    setCreatePostOpen(true);
  }, []);

  const jumpToStatusIndex = React.useCallback(
    (index: number) => {
      const target = ROADMAP_STATUSES[index];
      if (!target) return;
      jumpToStatus(target);
    },
    [jumpToStatus],
  );

  return (
    <section className="min-h-[72vh] min-w-0 space-y-3">
      {hasActiveFilters ? (
        <p className="text-xs text-accent">
          Showing {totalVisible} of {totalItems} items
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => handleDragStart(String(active.id))}
        onDragEnd={({ over }) => handleDragEnd(over?.id as string | undefined)}
      >
        <RoadmapKeyboardShortcuts
          columnCount={ROADMAP_STATUSES.length}
          getCurrentIndex={getCurrentStatusIndex}
          onJumpToIndex={jumpToStatusIndex}
        />
        <div
          ref={boardScrollRef}
          className="h-full min-h-[72vh] w-full min-w-0 overflow-x-auto bg-background pb-2 [scrollbar-width:thin] snap-x snap-mandatory md:snap-none"
        >
          <div className="flex min-h-[72vh] min-w-max gap-4 md:min-w-full md:flex-row md:items-stretch">
            {(ROADMAP_STATUSES as readonly string[]).map((s) => {
              const itemsForStatus = grouped[s];
              return (
                <div
                  key={s}
                  ref={(node) => setColumnRef(s, node)}
                  className={cn(
                    "w-[85vw] shrink-0 snap-center overflow-hidden sm:w-[320px] md:h-full md:w-auto",
                    ROADMAP_COLUMN_WIDTH_TRANSITION_CLASS,
                    roadmapColumnWidthClass(!!collapsedByStatus[s]),
                  )}
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
                            isSaving={isSaving}
                          >
                            <RequestItemContextMenu
                              item={it}
                              workspaceSlug={workspaceSlug}
                              requestHref={`/workspaces/${workspaceSlug}/requests/${it.slug}`}
                              className="h-full"
                            >
                              <RoadmapRequestItem
                                item={toRoadmapCardItem(it)}
                                workspaceSlug={workspaceSlug}
                              />
                            </RequestItemContextMenu>
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
              className={cn(
                overlayShellClass,
                "pointer-events-none h-[152px] w-[min(320px,85vw)] p-1 shadow-lg",
              )}
              initial={{ scale: 0.995, opacity: 0.97 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 32 }}
            >
              <div className={cn(overlayInnerClass, "flex h-full min-w-0 flex-col")}>
                <RoadmapRequestItem
                  item={toRoadmapCardItem(activeItem)}
                  workspaceSlug={workspaceSlug}
                />
              </div>
            </motion.div>
          ) : null}
        </DragOverlay>
        <CreatePostModal
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          workspaceSlug={workspaceSlug}
          user={currentUser}
          initialStatus={createPostStatus}
        />
      </DndContext>
    </section>
  );
}
