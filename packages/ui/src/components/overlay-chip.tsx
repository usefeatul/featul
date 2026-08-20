import * as React from "react"

import {
  overlayChipInnerClass,
  overlayChipShellClass,
} from "../lib/overlay"
import { cn } from "../lib/utils"

export const OverlayChip = React.forwardRef<
  HTMLSpanElement,
  {
    className?: string
    innerClassName?: string
    children?: React.ReactNode
  }
>(function OverlayChip({ className, innerClassName, children }, ref) {
  return (
    <span ref={ref} className={cn(overlayChipShellClass, className)}>
      <span className={cn(overlayChipInnerClass, innerClassName)}>{children}</span>
    </span>
  )
})
