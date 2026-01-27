"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { useIsMobile } from "@featul/ui/hooks/use-mobile";
const GliderContext = React.createContext<{
  value?: string;
  onHover?: (el: HTMLElement) => void;
  onActive?: (el: HTMLElement) => void;
} | null>(null);

type TabsRootProps = React.ComponentProps<typeof BaseTabs.Root>;

function Tabs({ className, onValueChange, ...props }: TabsRootProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    () => (props as any).value ?? (props as any).defaultValue
  );

  const handleValueChange: TabsRootProps["onValueChange"] = (
    value,
    eventDetails
  ) => {
    setInternalValue(value as string | undefined);
    onValueChange?.(value, eventDetails);
  };

  const value = ((props as any).value as string | undefined) ?? internalValue;

  return (
    <GliderContext.Provider value={{ value }}>
      <BaseTabs.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
        onValueChange={handleValueChange}
      />
    </GliderContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const ctx = React.useContext(GliderContext);
  const isMobile = useIsMobile();
  const [indicator, setIndicator] = React.useState<{
    x: number;
    width: number;
    visible: boolean;
  }>({ x: 0, width: 0, visible: false });
  const [hover, setHover] = React.useState<{
    x: number;
    width: number;
    visible: boolean;
  }>({ x: 0, width: 0, visible: false });

  const computeMetrics = React.useCallback((el: HTMLElement | null) => {
    const root = listRef.current;
    if (!el || !root) return null;
    const navRect = root.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const x = rect.left - navRect.left;
    const width = rect.width;
    return { x, width };
  }, []);

  const measure = React.useCallback(
    (el: HTMLElement | null) => {
      const m = computeMetrics(el);
      if (!m) return;
      requestAnimationFrame(() => {
        setIndicator({ x: m.x, width: m.width, visible: true });
      });
    },
    [computeMetrics]
  );

  const measureHover = React.useCallback(
    (el: HTMLElement | null) => {
      if (!el) {
        requestAnimationFrame(() =>
          setHover((prev) => ({ x: prev.x, width: prev.width, visible: false }))
        );
        return;
      }
      const m = computeMetrics(el);
      if (!m) return;
      requestAnimationFrame(() =>
        setHover({ x: m.x, width: m.width, visible: true })
      );
    },
    [computeMetrics]
  );

  React.useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const v = ctx?.value;
    if (!v) return;
    const el = root.querySelector<HTMLElement>(
      `[data-slot="tabs-trigger"][data-value="${v}"]`
    );
    if (!isMobile) measure(el);
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [ctx?.value, measure, isMobile]);

  return (
    <BaseTabs.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "relative flex w-full items-center gap-2 pb-2 flex-nowrap overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] whitespace-nowrap scrollbar-hide lg:flex-wrap lg:overflow-visible",
        className
      )}
      onPointerLeave={() =>
        setHover((prev) => ({ x: prev.x, width: prev.width, visible: false }))
      }
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 bg-border left-0 right-0 h-px z-0"
      />

      {
        !isMobile && (
          <AnimatePresence>
            {hover.visible && (
              <motion.div
                key="hover"
                className={cn(
                  "pointer-events-none absolute top-0 bottom-1 left-0 mb-1 rounded-md bg-accent/10 z-0"
                )}
                initial={{ opacity: 0, x: hover.x, width: hover.width }}
                animate={{ opacity: 1, x: hover.x, width: hover.width }}
                exit={{ opacity: 0, x: hover.x, width: hover.width }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
              />
            )}
          </AnimatePresence>
        )
      }
      <GliderContext.Provider
        value={{
          value: ctx?.value,
          onHover: isMobile ? undefined : (el) => measureHover(el),
          onActive: isMobile
            ? undefined
            : (el) => {
              measure(el);
              measureHover(null);
            },
        }}
      >
        {props.children}
      </GliderContext.Provider>
      {
        !isMobile && (
          <AnimatePresence>
            {indicator.visible && (
              <motion.div
                key="selected"
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-md bg-primary z-10"
                )}
                initial={false}
                animate={{ x: indicator.x, width: indicator.width, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        )
      }
    </BaseTabs.List >
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  const ctx = React.useContext(GliderContext);
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      data-value={(props as any).value}
      className={cn(
        "inline-flex items-center justify-center gap-3 px-2 py-2 text-sm font-medium whitespace-nowrap border-b-2 border-transparent transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground snap-center data-[state=active]:border-primary md:data-[state=active]:border-transparent",
        className
      )}
      {...props}
      onPointerEnter={(e) => {
        ctx?.onHover?.(e.currentTarget as HTMLElement);
        (props as any).onPointerEnter?.(e);
      }}
      onPointerDown={(e) => {
        ctx?.onActive?.(e.currentTarget as HTMLElement);
        (props as any).onPointerDown?.(e);
      }}
      onFocus={(e) => {
        ctx?.onHover?.(e.currentTarget as HTMLElement);
        (props as any).onFocus?.(e);
      }}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
