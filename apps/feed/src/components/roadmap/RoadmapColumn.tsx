"use client"

import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { ChevronDown } from "lucide-react"
import StatusIcon from "@/components/requests/StatusIcon"

export default function RoadmapColumn({
  id,
  label,
  count,
  collapsed,
  onToggle,
  children,
}: {
  id: string
  label: string
  count: number
  collapsed?: boolean
  onToggle?: (next: boolean) => void
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border overflow-hidden transition-all ${isOver ? "border-green-500 ring-2 ring-green-300" : "bg-card"}`}
    >
      <div
        className={`${collapsed ? "px-2 py-1" : "px-3 py-2"} flex items-center justify-between cursor-pointer`}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => onToggle?.(!collapsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle?.(!collapsed)
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon status={id} className={`${collapsed ? "size-4" : "size-4"} text-foreground/80 shrink-0`} />
          {!collapsed ? <div className="text-sm font-medium truncate flex-1">{label}</div> : null}
          <div className="text-[10px] font-mono tabular-nums rounded-md bg-muted px-2 py-0.5 text-accent shrink-0">{count}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={collapsed ? "Expand" : "Collapse"}
            onClick={(e) => {
              e.stopPropagation()
              onToggle?.(!collapsed)
            }}
            className="inline-flex items-center justify-center size-6 rounded-md hover:bg-muted text-accent hover:text-primary"
          >
            <ChevronDown className={`size-4 transition-transform ${collapsed ? "rotate-180" : "rotate-0"}`} />
          </button>
        </div>
      </div>
      {!collapsed ? (
        <ul className={`p-3 space-y-2 min-h-24`}> 
          {children}
          {isOver ? <li className="mt-2 border-t-2 border-green-500 rounded-full" aria-hidden /> : null}
        </ul>
      ) : null}
    </div>
  )
}
