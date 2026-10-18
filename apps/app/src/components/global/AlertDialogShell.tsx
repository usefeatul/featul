"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogInner,
  AlertDialogTitle,
} from "@featul/ui/components/alert-dialog"
import { TrashIcon } from "@/components/global/icons"

type AlertDialogShellProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  /** "default" matches 440, "wide" matches 540, "widest" matches 740, "xl" matches 840, "xxl" matches 1160 */
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
      ? { width: "min(92vw, 1160px)", maxWidth: "none" as const }
      : width === "xl"
        ? { width: "min(92vw, 840px)", maxWidth: "none" as const }
        : width === "widest"
          ? { width: "min(92vw, 740px)", maxWidth: "none" as const }
          : width === "wide"
            ? { width: "min(92vw, 540px)", maxWidth: "none" as const }
            : { width: "min(92vw, 440px)", maxWidth: "none" as const }

  const topValue = typeof offsetY === "number" ? `${offsetY}%` : offsetY
  const positionStyle: React.CSSProperties = { top: topValue, ["--tw-translate-y" as PropertyKey]: `-${topValue}` }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent showCloseButton style={{ ...styleWidth, ...positionStyle }} className="max-w-none sm:max-w-none">
        <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <AlertDialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-1.5 text-sm font-normal">
            {icon ?? <TrashIcon className="size-3.5 opacity-80" />}
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogInner>
          {description ? (
            <AlertDialogDescription className="text-sm text-accent mb-2">
              {description}
            </AlertDialogDescription>
          ) : null}
          {children}
        </AlertDialogInner>
      </AlertDialogContent>
    </AlertDialog>
  )
}

