"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@feedgot/ui/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const [indicator, setIndicator] = React.useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false })
  const [hover, setHover] = React.useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false })

  const measure = React.useCallback((el: HTMLElement | null) => {
    if (!el || !listRef.current) return
    const rect = el.getBoundingClientRect()
    const parentRect = listRef.current.getBoundingClientRect()
    const left = rect.left - parentRect.left
    const width = rect.width
    setIndicator({ left, width, visible: true })
  }, [])

  const measureHover = React.useCallback((el: HTMLElement | null) => {
    if (!el || !listRef.current) return
    const rect = el.getBoundingClientRect()
    const parentRect = listRef.current.getBoundingClientRect()
    const left = rect.left - parentRect.left
    const width = rect.width
    setHover({ left, width, visible: true })
  }, [])

  const measureActive = React.useCallback(() => {
    const root = listRef.current
    if (!root) return
    const active = root.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]')
    measure(active)
  }, [measure])

  React.useEffect(() => {
    const root = listRef.current
    if (!root) return
    const observer = new MutationObserver(() => measureActive())
    observer.observe(root, { attributes: true, subtree: true, attributeFilter: ['data-state', 'class', 'style'] })
    measureActive()
    const onResize = () => measureActive()
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [measureActive, measure])

  React.useEffect(() => {
    const root = listRef.current
    if (!root) return
    const triggers = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=\"tabs-trigger\"]"))
    const onEnter = (e: Event) => measureHover(e.currentTarget as HTMLElement)
    const onLeave = () => setHover((h) => ({ ...h, visible: false }))
    triggers.forEach((t) => {
      t.addEventListener("mouseenter", onEnter)
    })
    root.addEventListener("mouseleave", onLeave)
    return () => {
      triggers.forEach((t) => {
        t.removeEventListener("mouseenter", onEnter)
      })
      root.removeEventListener("mouseleave", onLeave)
    }
  }, [measureHover])

  return (
    <TabsPrimitive.List
      ref={listRef as any}
      data-slot="tabs-list"
      className={cn(
        "relative flex w-full items-center gap-2 border-b pb-1",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 rounded-md bg-accent/10 transition-[left,width] duration-200",
          hover.visible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ left: hover.left, width: hover.width }}
      />
      {props.children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-primary transition-[left,width] duration-200",
          indicator.visible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-2 py-1 text-sm font-medium whitespace-nowrap border-b-2 border-transparent transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        className
      )}
      {...props}
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
