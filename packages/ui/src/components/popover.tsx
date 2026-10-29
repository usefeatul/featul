"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { useSlidingIndicator } from "@featul/ui/hooks/use-sliding-indicator";
import { cn } from "@featul/ui/lib/utils";
import { subtleOverlayInnerClass, subtleOverlayShellClass } from "@featul/ui/lib/overlay";

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
  unstyled = false,
  container,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  list?: boolean;
  unstyled?: boolean;
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
          !unstyled && subtleOverlayShellClass,
          list && "overflow-visible",
          "z-50 flex flex-col text-popover-foreground outline-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          list ? "w-max min-w-0" : "w-80",
          className,
        )}
        {...props}
      >
        {unstyled ? (
          children
        ) : (
          <div className={cn(list && "w-max")}>
            <div
              data-slot="popover-content-inner"
              className={cn(
                subtleOverlayInnerClass,
                list ? "overflow-visible p-0 w-max" : "p-3 [&>[data-slot=popover-separator]]:-mx-3",
              )}
            >
              {children}
            </div>
          </div>
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

const PopoverListContext = React.createContext<
  { activeId: string | null; accentRef: (el: HTMLElement | null) => void } | undefined
>(undefined);

function getPopoverItem(event: React.SyntheticEvent<HTMLDivElement>) {
  if (!(event.target instanceof Element)) return null;
  const item = event.target.closest<HTMLElement>("[data-popover-item-id]");
  if (
    !item ||
    item.closest('[data-slot="popover-list"]') !== event.currentTarget ||
    item.matches(':disabled, [aria-disabled="true"]')
  ) return null;
  return item.dataset.popoverItemId ?? null;
}

function PopoverList({
  className,
  children,
  onPointerMoveCapture,
  onPointerLeave,
  onFocusCapture,
  onBlurCapture,
  ...props
}: React.ComponentProps<"div">) {
  const accentRef = useSlidingIndicator({ duration: 160 });
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);

  return (
    <PopoverListContext.Provider value={{ activeId: hoveredId ?? focusedId, accentRef }}>
      <div
        data-slot="popover-list"
        className={cn(
          "inline-flex w-max max-h-[50vh] flex-col overflow-y-auto sm:max-h-64",
          className,
        )}
        {...props}
        onPointerMoveCapture={(event) => {
          onPointerMoveCapture?.(event);
          if (event.pointerType !== "touch") setHoveredId(getPopoverItem(event));
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setHoveredId(null);
        }}
        onFocusCapture={(event) => {
          onFocusCapture?.(event);
          setHoveredId(null);
          setFocusedId(getPopoverItem(event));
        }}
        onBlurCapture={(event) => {
          onBlurCapture?.(event);
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null);
        }}
      >
        {children}
      </div>
    </PopoverListContext.Provider>
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
  "data-selected"?: boolean | "true" | "false";
}) {
  const id = React.useId();
  const list = React.useContext(PopoverListContext);
  const activeId = list ? list.activeId : undefined;
  const selected = [props["aria-selected"], props["aria-checked"], props["aria-pressed"], props["data-selected"]]
    .some((value) => value === true || value === "true");
  const disabled = ("disabled" in props && props.disabled) || props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const active = activeId === id;
  const showAccent = !disabled && (active || (activeId == null && selected));
  const accentStyle = { borderColor: accent ?? "var(--primary)" };
  return (
    <Component
      data-slot="popover-list-item"
      data-popover-item-id={id}
      className={cn(
        "relative group group/popover-item flex cursor-pointer items-center gap-2 rounded-none first:rounded-t-md last:rounded-b-md px-3 py-2 text-left whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none hover:bg-foreground/[0.05] dark:hover:bg-foreground/[0.07]",
        className,
      )}
      {...(props as any)}
    >
      {!disabled && (showAccent || activeId === undefined) && (
        <span
          aria-hidden
          ref={active ? list?.accentRef : undefined}
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-[var(--radius)] border-l-2 group-first/popover-item:rounded-tl-md group-first/popover-item:border-t-2 group-last/popover-item:rounded-bl-md group-last/popover-item:border-b-2",
            activeId === undefined && !selected && "invisible group-hover/popover-item:visible group-focus-visible/popover-item:visible",
          )}
          style={accentStyle}
        />
      )}
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
        "flex w-full cursor-pointer items-center gap-2 border-b border-border/60 px-3 py-2 text-left text-sm hover:bg-foreground/[0.05] dark:hover:bg-foreground/[0.07]",
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
      className={cn("my-1 h-px bg-border/60", className)}
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
