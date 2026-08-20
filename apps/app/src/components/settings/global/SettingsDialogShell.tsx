"use client"

import React from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogInner, DialogTitle, DialogDescription } from "@featul/ui/components/dialog"
import MaximizeIcon from "@featul/ui/icons/maximize"
import MinimizeIcon from "@featul/ui/icons/minimize"

const DialogExpandedContext = React.createContext(false)

/** Whether the surrounding SettingsDialogShell is currently expanded. */
export function useDialogExpanded() {
  return React.useContext(DialogExpandedContext)
}

type DialogWidth = "default" | "wide" | "widest" | "xl" | "xxl"

const BASE_WIDTH_PX: Record<DialogWidth, number> = {
  default: 420,
  wide: 490,
  widest: 650,
  xl: 750,
  xxl: 1070,
}

const EXPANDED_WIDTH_PX: Record<DialogWidth, number> = {
  default: 560,
  wide: 640,
  widest: 800,
  xl: 880,
  xxl: 1200,
}

type SettingsDialogShellProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  /** "default" matches 450/380, "wide" matches 520/420, "widest" matches 680/800, "xl" matches 900/960, "xxl" matches 1040/1120 */
  width?: DialogWidth
  offsetY?: string | number
  icon?: React.ReactNode
  /** Shows an expand/collapse toggle that grows the dialog with a framer-motion animation. */
  expandable?: boolean
  onOpenAutoFocus?: (event: Event) => void
  children: React.ReactNode
}

export function SettingsDialogShell({
  open,
  onOpenChange,
  title,
  description,
  width = "default",
  offsetY = "50%",
  icon,
  expandable = false,
  onOpenAutoFocus,
  children,
}: SettingsDialogShellProps) {
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (!open) setExpanded(false)
  }, [open])

  const styleWidth = {
    width: `min(92vw, ${BASE_WIDTH_PX[width]}px)`,
    maxWidth: "none" as const,
  }

  const topValue = typeof offsetY === "number" ? `${offsetY}%` : offsetY
  const positionStyle: React.CSSProperties & { ["--tw-translate-y"]?: string } = {
    top: topValue,
    ["--tw-translate-y"]: `-${topValue}`,
  }

  const header = (
    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
      <DialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
        {icon}
        {title}
      </DialogTitle>
      {expandable ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="absolute top-3 right-8 inline-flex items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
          aria-label={expanded ? "Collapse dialog" : "Expand dialog"}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
        </button>
      ) : null}
    </DialogHeader>
  )

  const body = (
    <DialogInner className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {description ? (
        <DialogDescription className="mb-2 shrink-0 text-sm">
          {description}
        </DialogDescription>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">
        <DialogExpandedContext.Provider value={expanded}>
          {children}
        </DialogExpandedContext.Provider>
      </div>
    </DialogInner>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fluid
        style={{ ...(expandable ? {} : styleWidth), ...positionStyle }}
        className="flex max-h-[min(92dvh,680px)] max-w-none flex-col overflow-hidden sm:max-w-none"
        onOpenAutoFocus={onOpenAutoFocus}
      >
        {expandable ? (
          <motion.div
            className="flex min-w-0 flex-col gap-2"
            initial={false}
            animate={{
              width: expanded ? EXPANDED_WIDTH_PX[width] : BASE_WIDTH_PX[width],
              minHeight: expanded ? "45dvh" : "0dvh",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.9 }}
            style={{ maxWidth: "92vw" }}
          >
            {header}
            {body}
          </motion.div>
        ) : (
          <>
            {header}
            {body}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
