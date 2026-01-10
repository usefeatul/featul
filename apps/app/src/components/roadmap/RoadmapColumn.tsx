"use client"

import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { MoveVerticalIcon } from "@featul/ui/icons/vertical"
import { MoveHorizontalIcon } from "@featul/ui/icons/horizontal"
import StatusIcon from "@/components/requests/StatusIcon"
import { motion, AnimatePresence } from "framer-motion"

export default function RoadmapColumn({
  id,
  label,
  count,
  collapsed,
  onToggle,
  children,
  disableMotion,
}: {
  id: string
  label: string
  count: number
  collapsed?: boolean
  onToggle?: (next: boolean) => void
  children: React.ReactNode
  disableMotion?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <motion.div
      ref={setNodeRef}
      className={`rounded-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border dark:border-border/50 overflow-hidden transition-all duration-300 ease-out ${isOver ? "border-green-300 ring-1 ring-green-200" : "bg-card dark:bg-black/40"}`}
      layout
      initial={false}
      transition={{ type: "tween", ease: "easeOut", duration: disableMotion ? 0 : 0.28 }}
    >
      <div
        className={`${collapsed ? "px-2 py-2 relative flex flex-col items-center gap-2" : "px-3 py-2 flex items-center justify-between"} cursor-pointer`}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => onToggle?.(!collapsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle?.(!collapsed)
        }}
      >
        {collapsed ? (
          <>
            <MoveVerticalIcon className="size-3 block mx-auto text-accent" />
            <StatusIcon status={id} className="size-6 text-foreground/80 block mx-auto" />
            <div className="text-xs font-mono tabular-nums rounded-md  bg-muted px-2 py-0.5 text-accent border border-border ring-1 ring-border block mx-auto">{count}</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <StatusIcon status={id} className="size-4 text-foreground/80 shrink-0" />
              <div className="text-sm font-medium truncate flex-1">{label}</div>
              <div className="text-xs font-mono tabular-nums rounded-md  bg-muted px-2 py-0.5 text-accent border border-border ring-1 ring-border shrink-0">{count}</div>
            </div>
            <div className="flex items-center gap-2">
              <MoveHorizontalIcon className="size-3 text-accent" />
            </div>
          </>
        )}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.ul
            className={`p-3 space-y-2 min-h-24`}
            initial={false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: disableMotion ? 0 : 0.32 }}
          >
            {children}
            {isOver ? (
              <motion.li
                className="mt-2 border-t-2 border-green-300 rounded-md"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: disableMotion ? 0 : 0.08 }}
              />
            ) : null}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
