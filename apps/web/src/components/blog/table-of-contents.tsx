"use client"
import { cn } from "@feedgot/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import { useEffect, useState } from "react"

type TableOfContentsProps = {
  items: TocItem[]
  className?: string
  title?: string
}

export function TableOfContents({ items, className, title = "Table of content" }: TableOfContentsProps) {
  if (!items?.length) return null
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

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

  function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    // Allow reduced-motion users to avoid smooth animations
    const prefersReducedMotion = typeof window !== "undefined" &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      aria-label="Table of contents"
      className={cn(
        "text-sm text-accent max-h-[75vh] overflow-auto",
        className
      )}
    >
      <div className="text-md font-bold text-foreground mb-2">{title}</div>
      <ul className="space-y-1 list-none pl-0 m-0">
        {items.map((item, i) => (
          <li key={item.id} className={cn("leading-snug text-left")}> 
            <a
              href={`#${item.id}`}
              onClick={(e) => onAnchorClick(e, item.id)}
              className={cn(
                "block py-1 text-left text-accent hover:text-primary hover:underline underline-offset-2 decoration-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
                item.level === 2 ? "font-medium" : "font-normal",
                activeId === item.id && "text-primary font-semibold"
              )}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              <span className="mr-2 tabular-nums">{i + 1}.</span>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}