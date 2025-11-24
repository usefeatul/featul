"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@feedgot/ui/lib/utils"
const GliderContext = React.createContext<{ value?: string; onHover?: (el: HTMLElement) => void; onActive?: (el: HTMLElement) => void } | null>(null)

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const value = (props as any).value as string | undefined
  return (
    <GliderContext.Provider value={{ value }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </GliderContext.Provider>
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const ctx = React.useContext(GliderContext)
  const [indicator, setIndicator] = React.useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false })
  const [hover, setHover] = React.useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false })
  const [ready, setReady] = React.useState(false)

  const measure = React.useCallback((el: HTMLElement | null) => {
    if (!el || !listRef.current) return
    const left = el.offsetLeft
    const width = el.offsetWidth
    requestAnimationFrame(() => {
      setIndicator({ left, width, visible: true })
    })
  }, [])

  const measureHover = React.useCallback((el: HTMLElement | null) => {
    const root = listRef.current
    if (!root) return
    if (!el) {
      requestAnimationFrame(() => setHover((prev) => ({ left: prev.left, width: prev.width, visible: false })))
      return
    }
    const left = el.offsetLeft
    const width = el.offsetWidth
    requestAnimationFrame(() => setHover({ left, width, visible: true }))
  }, [])

  React.useLayoutEffect(() => {
    const root = listRef.current
    if (!root) return
    const v = ctx?.value
    if (!v) return
    const el = root.querySelector<HTMLElement>(`[data-slot="tabs-trigger"][data-value="${v}"]`)
    setReady(true)
    measure(el)
  }, [ctx?.value, measure])

  return (
    <TabsPrimitive.List
      ref={listRef as any}
      data-slot="tabs-list"
      className={cn("relative flex w-full items-center gap-2 border-b pb-1", className)}
      onPointerLeave={() => setHover((prev) => ({ left: prev.left, width: prev.width, visible: false }))}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 bottom-1 rounded-md bg-accent/10 transition-[transform,width] duration-200 will-change-transform",
          hover.visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: `translateX(${hover.left}px)`, width: hover.width }}
      />
      <GliderContext.Provider value={{ value: ctx?.value, onHover: (el) => measureHover(el), onActive: (el) => { setReady(false); measure(el); measureHover(null) } }}>
        {props.children}
      </GliderContext.Provider>
      <span
        aria-hidden
        className={cn(
          ready ? "pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-primary transition-transform duration-200 will-change-transform" : "pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-primary transition-none",
          indicator.visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
      />
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = React.useContext(GliderContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-value={(props as any).value}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-2 py-1 text-sm font-medium whitespace-nowrap border-b-2 border-transparent transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        className
      )}
      {...props}
      onPointerEnter={(e) => { ctx?.onHover?.(e.currentTarget as HTMLElement); (props as any).onPointerEnter?.(e) }}
      onPointerDown={(e) => { ctx?.onActive?.(e.currentTarget as HTMLElement); (props as any).onPointerDown?.(e) }}
      onFocus={(e) => { ctx?.onHover?.(e.currentTarget as HTMLElement); (props as any).onFocus?.(e) }}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
