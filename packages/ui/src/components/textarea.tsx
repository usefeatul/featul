import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@featul/ui/lib/utils"

const textareaVariants = cva(
  "placeholder:text-accent flex field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border border-border ",
  {
    variants: {
      variant: {
        default: "border-input bg-card border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px] dark:bg-black/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        plain: "bg-transparent border-none shadow-none focus-visible:ring-0 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Textarea({ className, variant, ...props }: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Textarea }
