"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@featul/ui/components/dialog"

type SettingsDialogShellProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  /** "default" matches 450/380, "wide" matches 520/420, "widest" matches 680/800, "xl" matches 900/960, "xxl" matches 1040/1120 */
  width?: "default" | "wide" | "widest" | "xl" | "xxl"
  offsetY?: string | number
  icon?: React.ReactNode
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
  children,
}: SettingsDialogShellProps) {
  const styleWidth =
    width === "xxl"
      ? { width: "min(92vw, 1120px)", maxWidth: "none" as const }
      : width === "xl"
      ? { width: "min(92vw, 780px)", maxWidth: "none" as const }
      : width === "widest"
      ? { width: "min(92vw, 680px)", maxWidth: "none" as const }
      : width === "wide"
      ? { width: "min(92vw, 520px)", maxWidth: "none" as const }
      : { width: "min(92vw, 450px)", maxWidth: "none" as const }

  const topValue = typeof offsetY === "number" ? `${offsetY}%` : offsetY
  const positionStyle: React.CSSProperties & { ["--tw-translate-y"]?: string } = {
    top: topValue,
    ["--tw-translate-y"]: `-${topValue}`,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fluid style={{ ...styleWidth, ...positionStyle }} className={`max-w-none sm:max-w-none p-1 bg-muted rounded-2xl gap-1`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-card rounded-lg p-2 dark:bg-black/60 border border-border">
          {description ? (
            <DialogDescription className="text-sm mb-2">
              {description}
            </DialogDescription>
          ) : null}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
