import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@featul/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center dark:text-white justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
  {
    variants: {
      variant: {
        default: "border border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "border border-destructive/20 bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60",
        outline: "border border-border/40 bg-background hover:bg-muted/50 hover:text-accent-foreground dark:border-white/8",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-black/40",
        ghost: "hover:bg-muted/50 hover:text-accent-foreground dark:hover:bg-muted/50 dark:bg-black/40",
        link: "text-primary dark:text-primary underline-offset-4 hover:underline bg-transparent",
        quiet: "bg-primary text-primary-foreground hover:bg-primary/70",
        nav: "border border-border/40 bg-card text-foreground hover:bg-muted/30 hover:text-accent-foreground dark:border-white/8 dark:bg-background dark:hover:bg-white/5",
        plain: "bg-card dark:bg-background text-foreground hover:bg-muted hover:text-accent-foreground dark:hover:bg-black/50",
        card: "border border-border/40 bg-card text-foreground hover:bg-muted/20 hover:text-accent-foreground dark:border-white/8 dark:bg-black/50 dark:hover:bg-black/30",

      },
      size: {
        default: "h-8.5 px-1.5 py-1 rounded-md has-[>svg]:px-3",
        xs: "h-8.5 rounded-md  gap-1 px-1.5 py-1 has-[>svg]:px-2 text-xs",
        sm: "h-8.5 rounded-md  gap-1 px-2 py-2 has-[>svg]:px-2 text-xs",
        md: "h-9.5 rounded-md px-2 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-3 has-[>svg]:px-3",
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
  const baseClass = cn(buttonVariants({ variant, size }), className);

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
