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
  children: React.ReactNode
}

export function SettingsDialogShell({
  open,
  onOpenChange,
  title,
  description,
  width = "default",
  children,
}: SettingsDialogShellProps) {
  const widthClasses =
    width === "wide"
      ? "w-[min(92vw,520px)] sm:w-[420px]"
      : "w-[min(92vw,450px)] sm:w-[380px]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={widthClasses}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

