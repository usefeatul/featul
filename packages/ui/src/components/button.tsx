import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@featul/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center dark:text-white justify-center gap-2 whitespace-now rap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
  {
    variants: {
      variant: {
        default: cn(
          "relative bg-primary text-primary-foreground hover:bg-primary/90 ring-ring/60 hover:ring-ring border-border/80 dark:border-border/70 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]"
        ),
        destructive: cn(
          "relative bg-destructive text-white hover:bg-destructive/90 ring-destructive/50 hover:ring-destructive/60 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 border-destructive/70 dark:border-destructive/50 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]"
        ),
        outline: cn(
          "border bg-background shadow-xs hover:bg-muted hover:text-accent-foreground ring-border/60 hover:ring-accent/60 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black"
        ),
        secondary: cn(
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 ring-secondary/50 hover:ring-secondary/60 dark:bg-black/40"
        ),
        ghost: cn(
          "hover:bg-muted hover:text-accent-foreground ring-border/50 hover:ring-accent/60 dark:hover:bg-muted/50 dark:bg-black/40"
        ),
        link: "text-primary dark:text-primary underline-offset-4 hover:underline bg-transparent",

        quiet: cn("bg-primary text-primary-foreground hover:bg-primary/70"),
        nav: cn(
          "relative border bg-card text-foreground border-border/80 dark:border-border/70 hover:bg-muted/30 hover:text-accent-foreground hover:border-accent/20 dark:bg-black/30 dark:hover:bg-black/40 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]"
        ),
        plain: cn(
          "bg-background text-foreground hover:bg-muted hover:text-accent-foreground dark:hover:bg-black/50 "
        ),
        card: cn(
          "bg-card dark:bg-black/50 text-foreground border border-border hover:bg-muted/20 hover:text-accent-foreground dark:hover:bg-black/30"
        ),
        // changelog: cn(
        //   "bg-card text-foreground hover:bg-muted/30 hover:text-accent-foreground hover:border-accent/20 dark:bg-black/30 dark:hover:bg-black/40"
        // ),

      },
      size: {
        default: "h-8.5 px-1.5 py-1 rounded-md has-[>svg]:px-3",
        xs: "h-8.5 rounded-md  gap-1 px-1.5 py-1 has-[>svg]:px-2 text-xs",
        sm: "h-8.5 rounded-md  gap-1 px-2 py-2 has-[>svg]:px-2 text-xs",
        md: "h-9.5 rounded-md px-2 has-[>svg]:px-2.5",
        lg: "h-10.5 rounded-md px-3 has-[>svg]:px-3",
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
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const baseClass = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...(props as any),
      "data-slot": "button",
      className: cn(baseClass, (child.props as any)?.className),
    } as any);
  }

  return (
    <button data-slot="button" className={baseClass} {...props}>
      {children}
    </button>
  );
}

export { Button, buttonVariants };
