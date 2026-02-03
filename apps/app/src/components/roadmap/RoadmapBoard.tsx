"use client"

import React from "react"
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core"
import { motion, AnimatePresence } from "framer-motion"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import RoadmapRequestItem from "@/components/roadmap/RoadmapRequestItem"
import { useQueryClient } from "@tanstack/react-query"
import RoadmapColumn from "@/components/roadmap/RoadmapColumn"
import RoadmapDraggable from "@/components/roadmap/RoadmapDraggable"
import { ROADMAP_STATUSES, statusLabel, groupItemsByStatus, encodeCollapsed } from "@/lib/roadmap"
import type { RequestItemData } from "@/types/request"


type Item = RequestItemData
type RoadmapStatus = (typeof ROADMAP_STATUSES)[number]

const isRoadmapStatus = (value: string): value is RoadmapStatus =>
  (ROADMAP_STATUSES as readonly string[]).includes(value)

export default function RoadmapBoard({ workspaceSlug, items: initialItems, initialCollapsedByStatus }: { workspaceSlug: string; items: Item[]; initialCollapsedByStatus?: Record<string, boolean> }) {
  const [items, setItems] = React.useState<Item[]>(() => initialItems)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [collapsedByStatus, setCollapsedByStatus] = React.useState<Record<string, boolean>>(() => {
    const acc: Record<string, boolean> = {}
    for (const s of ROADMAP_STATUSES) acc[s] = !!initialCollapsedByStatus?.[s]
    return acc
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const queryClient = useQueryClient()

  React.useEffect(() => {
    try {
      const encoded = encodeCollapsed(collapsedByStatus)
      document.cookie = `rdmpc:${workspaceSlug}=${encoded}; path=/; max-age=31536000`
    } catch {}
  }, [collapsedByStatus, workspaceSlug])

  React.useEffect(() => {
    try {
      if (activeId) {
        document.body.style.cursor = "grabbing"
      } else {
        document.body.style.cursor = ""
      }
    } catch {}
    return () => {
      try {
        document.body.style.cursor = ""
      } catch {}
    }
  }, [activeId])

  const grouped = React.useMemo(() => groupItemsByStatus(items), [items])

  const handleDragStart = (id: string) => {
    setActiveId(id)
  }

  const onDragEnd = async (overId?: string) => {
    const dragged = items.find((i) => i.id === activeId)
    setActiveId(null)
    if (!dragged) return
    const target = (overId || "").toLowerCase()
    if (!isRoadmapStatus(target)) return
    if ((dragged.roadmapStatus || "pending").toLowerCase() === target) return
    const normalize = (s: string): RoadmapStatus => {
      const raw = (s || "pending").trim().toLowerCase().replace(/[\s-]+/g, "")
      const map: Record<string, RoadmapStatus> = {
        pending: "pending",
        review: "review",
        inreviewing: "review",
        planned: "planned",
        progress: "progress",
        inprogress: "progress",
        completed: "completed",
        closed: "closed",
      }
      return map[raw] || "pending"
    }
    const prev = normalize(dragged.roadmapStatus || "pending")
    const next = normalize(target)
    setItems((prevItems) => prevItems.map((i) => (i.id === dragged.id ? { ...i, roadmapStatus: target } : i)))
    queryClient.setQueryData<Record<string, number> | undefined>(["status-counts", workspaceSlug], (prevCounts) => {
      if (!prevCounts) return prevCounts
      const copy: Record<string, number> = { ...prevCounts }
      if (typeof copy[prev] === "number") copy[prev] = Math.max(0, (copy[prev] || 0) - 1)
      copy[next] = ((copy[next] || 0) + 1)
      return copy
    })
    setSavingId(dragged.id)
    try {
      await client.board.updatePostMeta.$post({ postId: dragged.id, roadmapStatus: target })
      queryClient.invalidateQueries({ queryKey: ["status-counts", workspaceSlug] })
      toast.success("Status updated")
    } catch (err: unknown) {
      setItems((prevItems) => prevItems.map((i) => (i.id === dragged.id ? { ...i, roadmapStatus: prev || null } : i)))
      queryClient.invalidateQueries({ queryKey: ["status-counts", workspaceSlug] })
      const message = err instanceof Error ? err.message : "Failed to update status"
      toast.error(message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => handleDragStart(String(active.id))}
        onDragEnd={({ over }) => onDragEnd(over?.id as string | undefined)}
      >
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          {(ROADMAP_STATUSES as readonly string[]).map((s) => {
            const itemsForStatus = grouped[s]
            return (
              <div
                key={s}
                className={`w-full ${collapsedByStatus[s] ? "md:basis-20 md:grow-0 md:shrink-0" : "md:flex-1 md:min-w-0"}`}
              >
                <RoadmapColumn
                  id={s}
                  label={statusLabel(s)}
                  count={itemsForStatus?.length ?? 0}
                  collapsed={!!collapsedByStatus[s]}
                  onToggle={(next) => setCollapsedByStatus((prev) => ({ ...prev, [s]: next }))}
                >
                  <AnimatePresence initial={false}>
                    {(itemsForStatus || []).map((it) => {
                      const isSaving = savingId === it.id
                      return (
                        <RoadmapDraggable key={it.id} id={it.id} isDragging={activeId === it.id}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex-1 min-w-0">
                              <RoadmapRequestItem item={{ id: it.id, title: it.title, slug: it.slug, roadmapStatus: it.roadmapStatus, content: it.content }} workspaceSlug={workspaceSlug} />
                            </div>
                            {isSaving ? <span className="ml-2 text-xs text-accent">Saving…</span> : null}
                          </div>
                        </RoadmapDraggable>
                      )
                    })}
                  </AnimatePresence>
                </RoadmapColumn>
              </div>
            )
          })}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <motion.div
              className="rounded-md  border bg-background dark:bg-black/40  px-3 py-2 shadow-lg pointer-events-none"
              initial={{ scale: 0.995, opacity: 0.97 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 32 }}
            >
              {(() => {
                const it = items.find((i) => i.id === activeId)
                if (!it) return null
                return (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <RoadmapRequestItem item={{ id: it.id, title: it.title, slug: it.slug, roadmapStatus: it.roadmapStatus, content: it.content }} workspaceSlug={workspaceSlug} />
                    </div>
                    {savingId === it.id ? <span className="ml-2 text-xs text-accent">Saving…</span> : null}
                  </div>
                )
              })()}
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  )
}
