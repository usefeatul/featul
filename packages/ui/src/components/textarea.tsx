import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { raisedSurfaceClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"

const textareaVariants = cva(
  "placeholder:text-accent flex field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        // Same raised surface as the portal and help-center search fields.
        default: cn(
          raisedSurfaceClass,
          "rounded-lg transition-[filter,box-shadow,border-color] focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
        ),
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
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea }
