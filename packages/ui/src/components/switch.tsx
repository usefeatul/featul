"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@featul/ui/lib/utils";

const trackVariants = cva(
  // Recessed track (gradient + inner shadow); green with a lit edge when on. Squircle corners like buttons.
  "peer relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden rounded-lg [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.25)] border border-black/[0.1] bg-muted bg-linear-to-b from-[color-mix(in_oklab,var(--muted),var(--foreground)_6%)] to-muted p-px text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] outline-none transition-[filter,box-shadow,border-color] hover:brightness-[0.98] focus-visible:ring-[3px] focus-visible:ring-[#22c55e]/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:from-black/45 dark:to-black/25 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] dark:hover:brightness-125 data-[checked]:border-[#16a34a] data-[checked]:bg-[#22c55e] data-[checked]:from-[#2bd468] data-[checked]:to-[#1fb153] data-[checked]:shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:data-[checked]:border-[#16a34a] dark:data-[checked]:from-[#22c55e] dark:data-[checked]:to-[#18a049] dark:data-[checked]:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-5 w-8",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const thumbVariants = cva(
  "pointer-events-none relative z-10 block rounded-md [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[var(--radius)] border border-black/10 bg-white bg-linear-to-b from-white to-[#f1f1f1] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,0.2)] transition-transform translate-x-0",
  {
    variants: {
      size: {
        // Travel = track width − 2px border − 2px padding − thumb.
        sm: "size-3 data-[checked]:translate-x-3",
        default: "size-4 data-[checked]:translate-x-3",
        lg: "size-5 data-[checked]:translate-x-5",
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
