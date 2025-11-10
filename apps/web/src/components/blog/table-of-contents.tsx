"use client"
import { cn } from "@feedgot/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion"
import { ScrollArea } from "@feedgot/ui/components/scroll-area"

type TableOfContentsProps = {
  items: TocItem[]
  className?: string
  title?: string
}

export function TableOfContents({ items, className, title = "Table of content" }: TableOfContentsProps) {
  if (!items?.length) return null
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [collapsedHeight, setCollapsedHeight] = useState<number | undefined>(undefined)
  const navRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el)

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          // Choose the one with smallest boundingClientRect.top
          const topMost = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
          if (topMost) setActiveId(topMost.target.id)
        }
      },
      {
        root: null,
        // Trigger when heading reaches ~30% from top to feel responsive
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0, 1],
      }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  // Keep active item visible inside the ScrollArea when collapsed
  useEffect(() => {
    if (!activeId || expanded) return
    const container = navRef.current
    if (!container) return
    const viewport = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (!viewport) return
    const selectorId = (() => {
      try {
        // Safely escape in case id contains special characters
        // @ts-ignore: CSS.escape may not be typed in TS lib
        return CSS?.escape ? CSS.escape(activeId) : activeId
      } catch {
        return activeId
      }
    })()
    const anchor = viewport.querySelector<HTMLElement>(`a[href="#${selectorId}"]`)
    if (anchor) {
      anchor.scrollIntoView({ block: "nearest", inline: "nearest" })
    }
  }, [activeId, expanded])

  // Dynamically size collapsed ScrollArea to exactly 5 items
  useLayoutEffect(() => {
    if (expanded) return
    const container = navRef.current
    if (!container) return
    const viewport = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    const list = viewport?.querySelector<HTMLUListElement>('ul')
    if (!viewport || !list) return

    const compute = () => {
      const nodes = Array.from(list.children) as HTMLElement[]
      const count = Math.min(5, nodes.length)
      if (count === 0) return
      const first = nodes[0]
      const last = nodes[count - 1]
      // Include spacing introduced by Tailwind's space-y utilities by using offsets
      if (!last) return
      const height = (last.offsetTop + last.offsetHeight) - (first?.offsetTop ?? 0)
      // Add a small buffer to avoid clipping due to rounding/scrollbar
      setCollapsedHeight(Math.ceil(height) + 2)
    }

    // Initial compute and a microtask to catch font/layout changes
    compute()
    const t = setTimeout(compute, 0)

    // Observe viewport and first 5 items for responsive recalculation
    const ro = new ResizeObserver(() => compute())
    ro.observe(viewport)
    Array.from(list.children).slice(0, 5).forEach((el) => ro.observe(el as HTMLElement))

    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
  }, [items, expanded])

  function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    
    const el = document.getElementById(id)
    if (!el) return

    // Prevent default to avoid any router interception and ensure consistent behavior
    e.preventDefault()

    // Compute target position with scroll-margin-top support
    const marginTopRaw = getComputedStyle(el).scrollMarginTop
    const marginTop = parseFloat(marginTopRaw || '0') || 0
    const targetY = el.getBoundingClientRect().top + window.pageYOffset - marginTop

    const cssSupportsSmooth = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('scroll-behavior: smooth')

    if (prefersReducedMotion) {
      // Jump directly without animation
      window.scrollTo({ top: targetY, behavior: 'auto' })
    } else if (cssSupportsSmooth) {
      // Use native smooth scroll (more reliable in modern Safari)
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    } else {
      // Manual rAF-based smooth scroll fallback for older Safari
      const startY = window.scrollY
      const distance = Math.max(0, targetY - startY)
      const duration = Math.min(600, Math.max(250, distance * 0.5)) // adaptive duration
      const startTime = performance.now()
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

      const step = (now: number) => {
        const elapsed = now - startTime
        const t = Math.min(1, elapsed / duration)
        const eased = easeOutCubic(t)
        const nextY = startY + (targetY - startY) * eased
        window.scrollTo(0, nextY)
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    // Update the URL hash without causing full navigation
    if (history && history.replaceState) {
      history.replaceState(null, '', `#${id}`)
    } else {
      window.location.hash = id
    }
  }
  return (
    <nav
      ref={navRef}
      aria-label="Table of contents"
      className={cn(
        "text-sm text-accent",
        className
      )}
    >
      <div className="text-md font-bold text-foreground mb-2">{title}</div>
      {expanded ? (
        <ul className="space-y-1 list-none pl-0 m-0">
          {items.map((item, i) => (
            <li key={item.id} className={cn("leading-snug text-left")}> 
              <a
                href={`#${item.id}`}
                onClick={(e) => onAnchorClick(e, item.id)}
                className={cn(
                  "block py-1 text-left text-xs text-accent hover:text-primary hover:underline underline-offset-2 decoration-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
                  item.level === 2 ? "font-light" : "font-normal",
                  activeId === item.id && "text-primary font-light"
                )}
                aria-current={activeId === item.id ? "page" : undefined}
              >
                <span className="mr-2 tabular-nums">{i + 1}.</span>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <ScrollArea className={cn("pr-1", collapsedHeight ? undefined : "h-44")}
          style={collapsedHeight ? { height: collapsedHeight } : undefined}
        >
          <ul className="space-y-1 list-none pl-0 m-0">
            {items.map((item, i) => (
              <li key={item.id} className={cn("leading-snug text-left")}> 
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onAnchorClick(e, item.id)}
                  className={cn(
                    "block py-1 text-left text-xs text-accent hover:text-primary hover:underline underline-offset-2 decoration-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
                    item.level === 2 ? "font-light" : "font-normal",
                    activeId === item.id && "text-primary font-light"
                  )}
                  aria-current={activeId === item.id ? "page" : undefined}
                >
                  <span className="mr-2 tabular-nums">{i + 1}.</span>
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
      {items.length > 5 && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </nav>
  )
}