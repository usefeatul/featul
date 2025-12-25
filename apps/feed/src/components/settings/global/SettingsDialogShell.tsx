"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"

type SettingsDialogShellProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  /** "default" matches 450/380, "wide" matches 520/420, "widest" matches 680/800, "xl" matches 900/960, "xxl" matches 1040/1120 */
  width?: "default" | "wide" | "widest" | "xl" | "xxl"
  icon?: React.ReactNode
  children: React.ReactNode
}

export function SettingsDialogShell({
  open,
  onOpenChange,
  title,
  description,
  width = "default",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fluid style={styleWidth} className={`max-w-none sm:max-w-none p-1 bg-muted rounded-xl gap-2`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <DialogTitle className="flex items-center gap-2 px-2 mt-1 py-1 text-sm font-normal">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
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
