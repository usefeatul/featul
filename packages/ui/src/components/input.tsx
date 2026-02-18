import * as React from "react"
import { Input as BaseInput } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@featul/ui/lib/utils"

const inputVariants = cva(
  "file:text-foreground dark:bg-black/5 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-8 w-full min-w-0 rounded-md p-2  px-3 py-2 text-base transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline-none",
  {
    variants: {
      variant: {
        default: "border-input bg-muted dark:bg-black/5 border border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px] dark:bg-input/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        plain: "bg-transparent border-none shadow-none focus-visible:ring-0 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type InputProps = React.ComponentProps<typeof BaseInput> &
  VariantProps<typeof inputVariants>

function Input({ className, type, variant, ...props }: InputProps) {
  return (
    <BaseInput
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Input }
