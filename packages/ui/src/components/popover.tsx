"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@featul/ui/lib/utils";
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";

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
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  list?: boolean;
  container?: HTMLElement | null;
}) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        data-variant={list ? "list" : undefined}
        className={cn(
          overlayShellClass,
          "z-50 flex w-80 flex-col text-popover-foreground outline-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          list && "w-fit min-w-0",
          className,
        )}
        {...props}
      >
        <div className="p-1">
          <div
            data-slot="popover-content-inner"
            className={cn(overlayInnerClass, list ? "p-0" : "p-2")}
          >
            {children}
          </div>
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-list"
      className={cn("max-h-[50vh] overflow-y-auto sm:max-h-64", className)}
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
        "relative group flex w-full cursor-pointer items-center gap-3 rounded-none px-3 py-2 text-left hover:bg-muted/40 dark:hover:bg-muted/30",
        className,
      )}
      {...(props as any)}
    >
      <span
        aria-hidden
        className="absolute bottom-0 left-0 top-0 w-[2px] opacity-0 group-hover:opacity-100"
        style={style}
      />
      {children}
    </Component>
  );
}

function PopoverListBack({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="popover-list-back"
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 border-b border-border px-3 py-2 text-left text-sm hover:bg-muted/40 dark:border-white/10 dark:hover:bg-muted/30",
        className,
      )}
      {...props}
    >
      {children}
    </button>
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
      className={cn("my-1 h-px bg-border dark:bg-white/10", className)}
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
  PopoverListBack,
  PopoverSeparator,
};
