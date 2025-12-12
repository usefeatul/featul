"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@oreilla/ui/lib/utils"

const trackVariants = cva(
  "peer inline-flex items-center rounded-md border shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#22c55e] data-[state=checked]:border-[#22c55e] data-[state=checked]:ring-2 data-[state=checked]:ring-[#22c55e]/40 data-[state=unchecked]:bg-muted data-[state=unchecked]:border-input data-[state=unchecked]:ring-1 data-[state=unchecked]:ring-foreground/10 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-[1.15rem] w-8",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-md ring-0 transition-transform bg-accent/30 shadow-xs data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "size-3",
        default: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Switch({ className, size = "default", ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof trackVariants>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn(trackVariants({ size, className }))} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={cn(thumbVariants({ size }))} />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
