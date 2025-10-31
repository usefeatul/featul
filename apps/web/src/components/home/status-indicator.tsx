"use client"
import { cn } from "@feedgot/ui/lib/utils"
import type { StatusIndicatorProps } from "../../types/status"
import { colorForStatus } from "../../types/status"


export function StatusIndicator({
  status = "operational",
  pulse = true,
  className,
  srLabel,
}: StatusIndicatorProps) {
  const color = colorForStatus(status)
  const label =
    srLabel ??
    (status === "operational"
      ? "Status: Operational"
      : `Status: ${status.replace("-", " ")}`)

  return (
    <span className={cn("relative inline-block size-2.5", className)}>
      {pulse && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full opacity-75 animate-ping",
            color
          )}
        />
      )}
      <span className={cn("relative block size-2.5 rounded-full", color)} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default StatusIndicator