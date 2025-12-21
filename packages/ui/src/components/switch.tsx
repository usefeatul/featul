"use client"

import * as React from "react"
import { Switch as BaseSwitch } from "@base-ui/react/switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@oreilla/ui/lib/utils"

const trackVariants = cva(
  "peer inline-flex items-center rounded-md  border shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-muted border-input ring-1 ring-foreground/10 data-[checked]:bg-[#22c55e] data-[checked]:border-[#22c55e] data-[checked]:ring-2 data-[checked]:ring-[#22c55e]/40 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
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
  "pointer-events-none block rounded-md  ring-0 transition-transform bg-accent/30 shadow-xs translate-x-0 data-[checked]:translate-x-[calc(100%-2px)]",
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

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> &
  VariantProps<typeof trackVariants>

function Switch({ className, size = "default", ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      className={cn(trackVariants({ size, className }))}
      {...props}
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={cn(thumbVariants({ size }))}
      />
    </BaseSwitch.Root>
  )
}

export { Switch }
