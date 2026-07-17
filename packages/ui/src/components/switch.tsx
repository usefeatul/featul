"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@featul/ui/lib/utils";

const trackVariants = cva(
  "peer relative inline-flex items-center overflow-hidden rounded-md border border-border bg-card text-foreground ring-1 ring-border/60 ring-offset-1 ring-offset-white transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/30 dark:border-border dark:bg-background dark:hover:bg-black/40 dark:ring-offset-black data-[checked]:bg-[#22c55e] dark:data-[checked]:bg-[#22c55e] data-[checked]:border-[#16a34a] dark:data-[checked]:border-[#16a34a] focus-visible:ring-[#22c55e]/40 focus-visible:ring-[3px] cursor-pointer before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]",
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
  },
);

const thumbVariants = cva(
  "pointer-events-none relative z-10 block rounded-md border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform translate-x-0 data-[checked]:translate-x-[calc(100%-2px)]",
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
  },
);

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> &
  VariantProps<typeof trackVariants>;

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
  );
}

export { Switch };
