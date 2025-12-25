"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@oreilla/ui/components/dialog"

import { SearchIcon } from "lucide-react"
import { cn } from "@oreilla/ui/lib/utils"

interface DialogShellProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  width?: "default" | "wide" | "widest" | "xl" | "xxl"
  offsetY?: string | number
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function DialogShell({
  open,
  onOpenChange,
  title,
  description,
  width = "default",
  offsetY = "50%",
  icon,
  className,
  children,
}: DialogShellProps) {
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
  const positionStyle = { top: topValue, ["--tw-translate-y" as any]: `-${topValue}` }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fluid
        style={{ ...styleWidth, ...positionStyle }}
        className={cn("max-w-none sm:max-w-none p-1 bg-muted rounded-xl gap-2", className)}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <DialogTitle className="flex items-center gap-2 px-2 mt-1 py-1 text-sm font-normal">
            {icon ?? <SearchIcon className="size-3.5 opacity-80" />}
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

