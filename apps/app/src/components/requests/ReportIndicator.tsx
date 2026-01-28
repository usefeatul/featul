
import React from "react"
import { FlagIcon } from "@featul/ui/icons/flag"
import { cn } from "@featul/ui/lib/utils"

interface ReportIndicatorProps {
    count: number
    className?: string
}

export function ReportIndicator({ count, className }: ReportIndicatorProps) {
    if (count < 3) return null

    return (
        <div
            className={cn("inline-flex items-center gap-1 text-red-500", className)}
            title={`Reported ${count} times`}
        >
            <FlagIcon className="size-3.5" />
            <span className="text-xs font-semibold tabular-nums">{count}</span>
        </div>
    )
}
