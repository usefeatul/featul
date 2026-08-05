"use client";

import React from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@featul/ui/components/button";
import RoadmapRequestItem from "@/components/roadmap/RoadmapRequestItem";
import RoadmapColumn from "@/components/roadmap/RoadmapColumn";
import RoadmapDraggable from "@/components/roadmap/RoadmapDraggable";
import RoadmapKeyboardShortcuts from "@/components/roadmap/RoadmapKeyboardShortcuts";
import RoadmapColumnJump from "@/components/roadmap/RoadmapColumnJump";
import RoadmapBulkToolbar from "@/components/roadmap/RoadmapBulkToolbar";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { RequestItemContextMenu } from "@/components/requests/RequestItemContextMenu";
import { ROADMAP_STATUSES, ROADMAP_PAGE_SIZE, statusLabel } from "@/lib/roadmap";
import {
  toRoadmapCardItem,
  useRoadmapBoardState,
} from "@/hooks/useRoadmapBoardState";
import { useRoadmapCanvasNavigation } from "@/hooks/useRoadmapCanvasNavigation";
import { useRoadmapFilters } from "@/hooks/useRoadmapFilters";
import {
  fetchRoadmapPostsPage,
  useRoadmapLiveRefresh,
} from "@/hooks/useRoadmapLiveRefresh";
import type { RequestItemData } from "@/types/request";
import type { PostUser } from "@/types/post";

function RoadmapCardList({
  items,
  workspaceSlug,
  activeId,
  savingId,
  isSelecting,
  selectedIds,
  onToggleSelect,
  readOnly = false,
  linkBase,
}: {
  items: RequestItemData[];
  workspaceSlug: string;
  activeId: string | null;
  savingId: string | null;
  isSelecting: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  readOnly?: boolean;
  linkBase?: string;
}) {
  return (
    <>
      {items.map((item) => {
        const isSaving = savingId === item.id;
        const card = (
          <RoadmapRequestItem
            item={toRoadmapCardItem(item)}
            workspaceSlug={workspaceSlug}
            showPreview={!readOnly}
            linkBase={linkBase}
          />
        );

        if (readOnly) {
          return (
            <li
              key={item.id}
              className="h-[152px] overflow-hidden rounded-md border border-border bg-background shadow-xs"
            >
              {card}
            </li>
          );
        }

        return (
          <RoadmapDraggable
            key={item.id}
            id={item.id}
            isDragging={activeId === item.id}
            isSaving={isSaving}
            isSelecting={isSelecting}
            isSelected={selectedIds.has(item.id)}
            onToggleSelect={(checked) => onToggleSelect(item.id, checked)}
          >
            {isSelecting ? (
              card
            ) : (
              <RequestItemContextMenu item={item} workspaceSlug={workspaceSlug} className="h-full">
                {card}
              </RequestItemContextMenu>
            )}
          </RoadmapDraggable>
        );
      })}
    </>
  );
}

export default function RoadmapBoard({
  workspaceSlug,
  items: initialItems,
  currentUser,
  initialCollapsedByStatus,
  totalCount: initialTotalCount,
  readOnly = false,
  linkBase,
}: {
  workspaceSlug: string;
  items: RequestItemData[];
  currentUser?: PostUser;
  initialCollapsedByStatus?: Record<string, boolean>;
  totalCount?: number;
  readOnly?: boolean;
  linkBase?: string;
}) {
  const [createPostOpen, setCreatePostOpen] = React.useState(false);
  const [createPostStatus, setCreatePostStatus] = React.useState("pending");
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = React.useState(initialTotalCount ?? initialItems.length);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [activeJumpStatus, setActiveJumpStatus] = React.useState<string>(
    ROADMAP_STATUSES[0],
  );

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
    replaceItems,
    appendItems,
  } = useRoadmapBoardState({
    workspaceSlug,
    initialItems,
    initialCollapsedByStatus,
  });

  const {
    grouped,
    swimlanes,
    hasActiveFilters,
    totalVisible,
    totalItems,
    groupItemsByBoard,
  } = useRoadmapFilters(items);

  useRoadmapLiveRefresh({
    workspaceSlug,
    enabled: !readOnly && !activeId,
    onRefresh: replaceItems,
  });

  const openCreatePost = React.useCallback((status = "pending") => {
    setCreatePostStatus(status);
    setCreatePostOpen(true);
  }, []);

  const jumpToStatusIndex = React.useCallback(
    (index: number) => {
      const target = ROADMAP_STATUSES[index];
      if (!target) return;
      setActiveJumpStatus(target);
      jumpToStatus(target);
    },
    [jumpToStatus],
  );

  const toggleSelect = React.useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const columnCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const status of ROADMAP_STATUSES) {
      counts[status] = grouped[status]?.length ?? 0;
    }
    return counts;
  }, [grouped]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const { posts, totalCount: nextTotal } = await fetchRoadmapPostsPage(
        workspaceSlug,
        items.length,
        ROADMAP_PAGE_SIZE,
      );
      appendItems(posts);
      setTotalCount(nextTotal);
    } catch {
      // noop
    } finally {
      setIsLoadingMore(false);
    }
  };

  const boardBody = (
    <div
      ref={boardScrollRef}
      className="h-full min-h-[72vh] w-full min-w-0 overflow-x-auto bg-background pb-2 [scrollbar-width:thin] snap-x snap-mandatory md:snap-none"
    >
      <div className="flex min-h-[72vh] min-w-max gap-4 md:min-w-full md:flex-row md:items-stretch">
        {(ROADMAP_STATUSES as readonly string[]).map((status) => {
          const itemsForStatus = grouped[status] || [];
          const lanes = swimlanes ? groupItemsByBoard(itemsForStatus) : null;

          return (
            <div
              key={status}
              ref={(node) => setColumnRef(status, node)}
              className={`w-[85vw] shrink-0 snap-center sm:w-[320px] md:h-full md:w-auto ${collapsedByStatus[status] ? "md:w-20 md:flex-none" : "md:min-w-[300px] md:flex-1 lg:min-w-[320px]"}`}
            >
              <RoadmapColumn
                id={status}
                label={statusLabel(status)}
                count={itemsForStatus.length}
                collapsed={!!collapsedByStatus[status]}
                onCreate={readOnly ? undefined : openCreatePost}
                onToggle={(next) => setColumnCollapsed(status, next)}
                sortableItemIds={itemsForStatus.map((item) => item.id)}
              >
                <AnimatePresence initial={false}>
                  {swimlanes && lanes
                    ? lanes.map((lane) => (
                        <React.Fragment key={`${status}-${lane.boardSlug}`}>
                          <li className="px-1 pt-1">
                            <div className="rounded-sm bg-muted/50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-accent">
                              {lane.boardName}
                            </div>
                          </li>
                          <RoadmapCardList
                            items={lane.items}
                            workspaceSlug={workspaceSlug}
                            activeId={activeId}
                            savingId={savingId}
                            isSelecting={isSelecting}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            readOnly={readOnly}
                            linkBase={linkBase}
                          />
                        </React.Fragment>
                      ))
                    : (
                      <RoadmapCardList
                        items={itemsForStatus}
                        workspaceSlug={workspaceSlug}
                        activeId={activeId}
                        savingId={savingId}
                        isSelecting={isSelecting}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        readOnly={readOnly}
                        linkBase={linkBase}
                      />
                    )}
                </AnimatePresence>
              </RoadmapColumn>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="min-h-[72vh] min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {hasActiveFilters ? (
          <p className="text-xs text-accent">
            Showing {totalVisible} of {totalItems} items
          </p>
        ) : null}
        {!readOnly ? (
          <Button
            type="button"
            variant="plain"
            size="sm"
            className="ml-auto h-7 px-2 text-xs text-accent hover:text-foreground"
            aria-pressed={isSelecting}
            onClick={() => {
              setIsSelecting((prev) => !prev);
              setSelectedIds(new Set());
            }}
          >
            {isSelecting ? "Done selecting" : "Select cards"}
          </Button>
        ) : null}
      </div>

      <RoadmapBulkToolbar
        workspaceSlug={workspaceSlug}
        selectedIds={Array.from(selectedIds)}
        onClear={() => setSelectedIds(new Set())}
        onComplete={() => setIsSelecting(false)}
      />

      <RoadmapColumnJump
        counts={columnCounts}
        activeStatus={activeJumpStatus}
        onJump={(status) => {
          setActiveJumpStatus(status);
          jumpToStatus(status);
        }}
      />

      {readOnly ? (
        boardBody
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active }) => handleDragStart(String(active.id))}
          onDragEnd={handleDragEnd}
        >
          <RoadmapKeyboardShortcuts
            columnCount={ROADMAP_STATUSES.length}
            getCurrentIndex={getCurrentStatusIndex}
            onJumpToIndex={jumpToStatusIndex}
          />
          {boardBody}
          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <motion.div
                className="pointer-events-none h-[152px] w-[min(320px,85vw)] overflow-hidden rounded-md border border-border bg-background shadow-lg"
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
            initialStatus={createPostStatus}
          />
        </DndContext>
      )}

      {!readOnly && items.length < totalCount ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="card"
            size="sm"
            className="h-8 px-4 text-xs"
            disabled={isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore
              ? "Loading…"
              : `Load more (${items.length}/${totalCount})`}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
