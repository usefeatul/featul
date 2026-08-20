"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"

export const toolbarShellClass = cn(
  overlayShellClass,
  "flex items-stretch p-1"
)

export const toolbarInnerClass = cn(
  overlayInnerClass,
  "flex min-h-8 flex-1 items-stretch"
)

export const toolbarItemClass =
  "h-full rounded-none border-none bg-transparent shadow-none ring-0 hover:bg-muted/40 dark:bg-transparent dark:hover:bg-muted/30"

const toolbarVariants = cva("flex items-stretch overflow-hidden", {
    variants: {
        variant: {
            default: toolbarShellClass,
            plain: "rounded-sm border border-border",
        },
        size: {
            default: "",
            sm: "",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
})

const Toolbar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toolbarVariants>
>(({ className, size, variant = "default", children, ...props }, ref) => {
    const isNested = variant !== "plain"

    return (
        <div
            ref={ref}
            className={cn(toolbarVariants({ size, variant }), className)}
            {...props}
        >
            {isNested ? <div className={toolbarInnerClass}>{children}</div> : children}
        </div>
    )
})
Toolbar.displayName = "Toolbar"

const ToolbarSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("w-px shrink-0 bg-border z-10 dark:bg-white/10", className)}
        {...props}
    />
))
ToolbarSeparator.displayName = "ToolbarSeparator"

export { Toolbar, ToolbarSeparator }
