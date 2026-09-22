"use client"

import * as React from "react"
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@featul/ui/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={cn(
        "peer relative inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input p-0 shadow-xs transition-colors outline-none dark:bg-input/30 data-[checked]:border-transparent data-[checked]:bg-primary data-[checked]:text-white data-[checked]:shadow-none dark:data-[checked]:border-transparent dark:data-[checked]:bg-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3" strokeWidth={3} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}

export { Checkbox }
