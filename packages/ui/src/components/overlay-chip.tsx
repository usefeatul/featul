import * as React from "react"

import {
  overlayChipInnerClass,
  overlayChipShellClass,
} from "../lib/overlay"
import { cn } from "../lib/utils"

export const OverlayChip = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    innerClassName?: string
  }
>(function OverlayChip({ className, innerClassName, children, ...props }, ref) {
  return (
    <span ref={ref} className={cn(overlayChipShellClass, className)} {...props}>
      <span className={cn(overlayChipInnerClass, innerClassName)}>{children}</span>
    </span>
  )
})
