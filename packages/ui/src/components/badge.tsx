import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { raisedSurfaceClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"

// Same depth as buttons and menus: soft vertical gradient, lit top edge, hairline shadow.
const surfaceClass = `${raisedSurfaceClass} text-foreground [a&]:hover:brightness-[0.97] dark:[a&]:hover:brightness-125`

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md [corner-shape:squircle] border bg-linear-to-b px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,filter] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-primary/60 bg-primary from-[color-mix(in_oklab,var(--primary),black_4%)] to-[color-mix(in_oklab,var(--primary),black_16%)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_1px_rgba(0,0,0,0.12)] [a&]:hover:brightness-110",
        secondary:
          "border-black/[0.08] bg-secondary from-secondary to-[color-mix(in_oklab,var(--secondary),var(--foreground)_5%)] text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_1px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:from-[color-mix(in_oklab,var(--secondary),white_4%)] dark:to-secondary dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_1px_rgba(0,0,0,0.3)] [a&]:hover:brightness-[0.97] dark:[a&]:hover:brightness-125",
        destructive:
          "border-destructive/60 bg-destructive from-destructive to-[color-mix(in_oklab,var(--destructive),black_12%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_1px_rgba(0,0,0,0.12)] [a&]:hover:brightness-110 focus-visible:ring-destructive/20 dark:from-[color-mix(in_oklab,var(--destructive),black_20%)] dark:to-[color-mix(in_oklab,var(--destructive),black_30%)] dark:focus-visible:ring-destructive/40",
        outline: surfaceClass,
        nav: surfaceClass,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({
  className,
  variant,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const baseClass = cn(badgeVariants({ variant }), className)

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<any>
    return React.cloneElement(child, {
      ...(props as any),
      "data-slot": "badge",
      className: cn(baseClass, (child.props as any)?.className),
    } as any)
  }

  return (
    <span
      data-slot="badge"
      className={baseClass}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
