import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@feedgot/ui/lib/utils"

  const buttonVariants = cva(
    "inline-flex items-center  dark:text-white justify-center gap-2 whitespace-now rap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
    {
      variants: {
        variant: {
          default: cn("bg-primary text-primary-foreground hover:bg-primary/90 ring-ring/60 hover:ring-ring"),
          destructive:
            cn("bg-destructive text-white hover:bg-destructive/90 ring-destructive/50 hover:ring-destructive/60 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"),
          outline:
            cn("border bg-background shadow-xs hover:bg-muted hover:text-accent-foreground ring-border/60 hover:ring-accent/60 dark:bg-input/30 dark:border-input dark:hover:bg-input/50"),
          secondary:    
            cn("bg-secondary text-secondary-foreground hover:bg-secondary/80 ring-secondary/50 hover:ring-secondary/60 dark:bg-black/40"),
          ghost:
            cn("hover:bg-muted hover:text-accent-foreground ring-border/50 hover:ring-accent/60 dark:hover:bg-muted/50 dark:bg-black/40"),
          link: "text-primary underline-offset-4 hover:underline bg-transparent",
          quiet: cn("bg-primary text-primary-foreground hover:bg-primary/70"),
          nav: cn("border bg-card text-foreground border-muted hover:bg-muted hover:text-accent-foreground hover:border-accent/20 dark:bg-black/40 dark:hover:bg-black/50"),
          plain: cn("bg-background text-foreground hover:bg-muted hover:text-accent-foreground"),
        },
        size: {
          default: "h-8 px-2 py-2 rounded-sm has-[>svg]:px-3",
          xs: "h-8 rounded-sm gap-1 px-2 has-[>svg]:px-2 text-xs",
          sm: "h-9 rounded-sm gap-1 px-3 has-[>svg]:px-2.5",
          lg: "h-10 rounded-sm px-4 has-[>svg]:px-3",
          icon: "size-9",
          "icon-sm": "size-8",
          "icon-lg": "size-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
