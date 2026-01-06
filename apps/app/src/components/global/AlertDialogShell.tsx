"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@featul/ui/components/alert-dialog"
import { TrashIcon } from "@featul/ui/icons/trash"

type AlertDialogShellProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  /** "default" matches 380, "wide" matches 480, "widest" matches 680, "xl" matches 780, "xxl" matches 1120 */
  width?: "default" | "wide" | "widest" | "xl" | "xxl"
  offsetY?: string | number
  icon?: React.ReactNode
  children: React.ReactNode
}

export function AlertDialogShell({
  open,
  onOpenChange,
  title,
  description,
  width = "default",
  offsetY = "50%",
  icon,
  children,
}: AlertDialogShellProps) {
  const styleWidth =
    width === "xxl"
      ? { width: "min(92vw, 1120px)", maxWidth: "none" as const }
      : width === "xl"
      ? { width: "min(92vw, 780px)", maxWidth: "none" as const }
      : width === "widest"
      ? { width: "min(92vw, 680px)", maxWidth: "none" as const }
      : width === "wide"
      ? { width: "min(92vw, 480px)", maxWidth: "none" as const }
      : { width: "min(92vw, 380px)", maxWidth: "none" as const }

  const topValue = typeof offsetY === "number" ? `${offsetY}%` : offsetY
  const positionStyle = { top: topValue, ["--tw-translate-y" as any]: `-${topValue}` }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent showCloseButton style={{ ...styleWidth, ...positionStyle }} className={`max-w-none sm:max-w-none p-1 bg-muted rounded-2xl gap-1`}>
        <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <AlertDialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
            {icon ?? <TrashIcon className="size-3.5 opacity-80" />}
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="bg-card rounded-lg p-2 dark:bg-black/60 border border-border">
          {description ? (
            <AlertDialogDescription className="text-sm mb-2">
              {description}
            </AlertDialogDescription>
          ) : null}
          {children}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

