import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { raisedSurfaceClass, selectorSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)] text-sm font-medium outline-none transition-[color,background-color,border-color,box-shadow,filter,translate] duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary/60 bg-primary from-[color-mix(in_oklab,var(--primary),black_8%)] to-[color-mix(in_oklab,var(--primary),black_20%)] text-primary-foreground hover:brightness-110",
        destructive:
          "border-destructive/60 bg-destructive from-destructive to-[color-mix(in_oklab,var(--destructive),black_12%)] text-white hover:brightness-110 focus-visible:ring-destructive/20 dark:from-[color-mix(in_oklab,var(--destructive),black_20%)] dark:to-[color-mix(in_oklab,var(--destructive),black_30%)] dark:focus-visible:ring-destructive/40",
        outline: `${raisedSurfaceClass} text-foreground hover:brightness-[0.97] aria-expanded:brightness-[0.97] dark:text-foreground dark:hover:brightness-125 dark:aria-expanded:brightness-125`,
        secondary:
          "border-foreground/60 bg-foreground from-foreground/85 to-foreground text-background hover:from-foreground/70 hover:to-foreground/85 dark:text-background",
        ghost: "hover:bg-muted/50 hover:text-accent-foreground dark:hover:bg-muted/50 dark:bg-black/40",
        link: "text-primary dark:text-primary underline-offset-4 hover:underline bg-transparent",
        quiet: "bg-primary text-primary-foreground hover:bg-primary/70",
        nav: `${raisedSurfaceClass} text-foreground hover:brightness-[0.97] hover:text-accent-foreground dark:text-foreground dark:hover:brightness-125`,
        plain: "bg-card dark:bg-background text-foreground hover:bg-muted hover:text-accent-foreground dark:hover:bg-black/50",
        card: `${raisedSurfaceClass} text-foreground hover:brightness-[0.97] hover:text-accent-foreground dark:text-foreground dark:hover:brightness-125`,
        /** Select/picker trigger: the card surface with only a hairline drop shadow. */
        selector: `${selectorSurfaceClass} text-foreground hover:brightness-[0.97] aria-expanded:brightness-[0.97] dark:text-foreground dark:hover:brightness-125 dark:aria-expanded:brightness-125`,
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
    compoundVariants: [
      {
        variant: ["default", "secondary", "outline", "destructive", "card", "nav", "selector"],
        className:
          "border bg-linear-to-b enabled:active:not-aria-[haspopup]:translate-y-px disabled:bg-none disabled:shadow-none",
      },
      {
        variant: ["default", "secondary", "destructive"],
        className:
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.18)]",
      },
    ],
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
