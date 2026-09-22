import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@featul/ui/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[color,background-color,border-color,box-shadow,filter] duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "overflow-hidden border border-primary/45 bg-primary bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_62%,rgba(0,0,0,0.12)_82%,rgba(0,0,0,0.18)_100%)] text-primary-foreground after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-black/15 after:content-[''] hover:brightness-[1.05] active:brightness-[0.96] active:after:bg-black/10 dark:hover:border-white/20 dark:hover:bg-[color-mix(in_oklab,var(--primary)_88%,white)] dark:hover:brightness-100",
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
        default: "h-8.5 px-1.5 py-1 has-[>svg]:px-3",
        xs: "h-8.5 gap-1 px-1.5 py-1 text-xs has-[>svg]:px-2",
        sm: "h-8.5 gap-1 px-2 py-2 text-xs has-[>svg]:px-2",
        md: "h-9.5 px-2 has-[>svg]:px-2.5",
        lg: "h-10 px-3 has-[>svg]:px-3",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
