"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@oreilla/ui/lib/utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  list = false,
  container,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { list?: boolean; container?: HTMLElement | null }) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        data-variant={list ? "list" : undefined}
        className={cn(
          list
            ? "bg-card text-popover-foreground  z-50 w-fit min-w-0 rounded-sm border p-0  outline-hidden"
            : "bg-card text-popover-foreground z-50 w-80 rounded-md border p-2  outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-list"
      className={cn("max-h-[50vh] sm:max-h-64 overflow-y-auto", className)}
      {...props}
    />
  );
}

function PopoverListItem({
  className,
  accent,
  children,
  as: Component = "button",
  ...props
}: (React.ComponentProps<"button"> | React.ComponentProps<"div">) & {
  accent?: string;
  as?: "button" | "div";
}) {
  const style = accent
    ? { background: accent }
    : { background: "var(--primary)" };
  return (
    <Component
      data-slot="popover-list-item"
      className={cn(
        "relative group w-full text-left px-3 py-2 hover:bg-muted dark:hover:bg-black/40 flex items-center gap-3 cursor-pointer rounded-none",
        className
      )}
      {...(props as any)}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100"
        style={style}
      />
      {children}
    </Component>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-separator"
      className={cn("bg-border h-px my-1", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverList,
  PopoverListItem,
  PopoverSeparator,
};
