"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"

type SettingsDialogShellProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  /** "default" matches 450/380 width, "wide" matches 520/420 width */
  width?: "default" | "wide"
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
  const widthClasses =
    width === "wide"
      ? "w-[min(92vw,520px)] sm:w-[420px]"
      : "w-[min(92vw,450px)] sm:w-[380px]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${widthClasses} p-1 bg-muted rounded-xl gap-2`}>
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
