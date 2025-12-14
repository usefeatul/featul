"use client"

import * as React from "react"
import { Popover as BasePopover } from "@base-ui/react/popover"

import { cn } from "@oreilla/ui/lib/utils"

// Root -----------------------------------------------------------------------

function Popover(
  props: React.ComponentProps<typeof BasePopover.Root>,
) {
  return <BasePopover.Root data-slot="popover" {...props} />
}

// Trigger --------------------------------------------------------------------

type BaseTriggerProps = React.ComponentPropsWithoutRef<
  typeof BasePopover.Trigger
>

type PopoverTriggerProps = Omit<BaseTriggerProps, "children" | "render"> & {
  asChild?: boolean
  children?: React.ReactNode
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: PopoverTriggerProps) {
  if (asChild) {
    return (
      <BasePopover.Trigger
        data-slot="popover-trigger"
        {...props}
        // Map Radix-style `asChild` to Base UI's `render` prop.
        render={(triggerProps) => {
          const child = React.Children.only(
            children,
          ) as React.ReactElement
          const mergedProps = Object.assign({}, triggerProps, child.props)
          return React.cloneElement(child, mergedProps)
        }}
      />
    )
  }

  return (
    <BasePopover.Trigger data-slot="popover-trigger" {...props}>
      {children}
    </BasePopover.Trigger>
  )
}

// Content --------------------------------------------------------------------

type BasePopupProps = React.ComponentPropsWithoutRef<typeof BasePopover.Popup>

type PopoverContentProps = Omit<BasePopupProps, "children" | "style"> & {
  children?: React.ReactNode
  style?: React.CSSProperties
  list?: boolean
  align?: React.ComponentPropsWithoutRef<
    typeof BasePopover.Positioner
  >["align"]
  sideOffset?: React.ComponentPropsWithoutRef<
    typeof BasePopover.Positioner
  >["sideOffset"]
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  list = false,
  style,
  children,
  ...rest
}: PopoverContentProps) {
  const [container, setContainer] =
    React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    // If we're inside one or more dialogs, attach the popover
    // portal to the top-most dialog content so it renders above it.
    const nodes =
      document.querySelectorAll<HTMLElement>(
        '[data-slot="dialog-content"]',
      )
    const last = nodes.length
      ? (nodes[nodes.length - 1] as HTMLElement)
      : null
    setContainer(last)
  }, [])

  return (
    <BasePopover.Portal container={container ?? undefined}>
      <BasePopover.Positioner align={align} sideOffset={sideOffset}>
        <BasePopover.Popup
          data-slot="popover-content"
          data-variant={list ? "list" : undefined}
          className={cn(
            list
              ? "bg-card text-popover-foreground z-60 w-fit min-w-0 rounded-md border p-0 outline-hidden"
              : "bg-card text-popover-foreground z-60 w-80 rounded-md border p-2 outline-hidden",
            className,
          )}
          style={{
            zIndex: 9999,
            ...style,
          }}
          {...rest}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

function PopoverList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-list"
      className={cn("max-h-[50vh] sm:max-h-64 overflow-y-auto", className)}
      {...props}
    />
  )
}

function PopoverListItem({ className, accent, children, ...props }: React.ComponentProps<"button"> & { accent?: string }) {
  const style = accent ? { background: accent } : { background: "var(--primary)" }
  return (
    <button
      data-slot="popover-list-item"
      className={cn("relative group w-full text-left px-3 py-2 hover:bg-muted dark:hover:bg-black/40 flex items-center gap-3 cursor-pointer", className)}
      {...props}
    >
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100" style={style} />
      {children}
    </button>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<"span">) {
  // Note: Base UI Popover uses the Trigger or an explicit `anchor` prop on Positioner.
  // This anchor element is currently only decorative to preserve the API surface,
  // since it's not used anywhere in the codebase yet.
  return <span data-slot="popover-anchor" {...props} />
}

function PopoverSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-separator"
      className={cn("bg-border h-px my-1", className)}
      {...props}
    />
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverList, PopoverListItem, PopoverSeparator }
