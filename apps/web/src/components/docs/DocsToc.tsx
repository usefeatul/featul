"use client"

import { cn } from "@featul/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import { useEffect, useState } from "react"

interface DocsTocProps {
  items: TocItem[]
}

export function DocsToc({ items }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (!items?.length) return

    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el)

    const container = document.querySelector<HTMLElement>(
      '[data-docs-scroll-container="true"]'
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return

        const topMost = visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )[0]
        if (!topMost) return

        setActiveId(topMost.target.id)
      },
      {
        root: container ?? null,
        rootMargin: "0px 0px -60% 0px",
        threshold: [0, 0.1, 0.5, 1],
      }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (!items?.length) return null

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const container = document.querySelector<HTMLElement>(
      '[data-docs-scroll-container="true"]'
    )
    const el = document.getElementById(id)
    if (!container || !el) return

    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offsetInContainer = elRect.top - containerRect.top
    const targetY = offsetInContainer + container.scrollTop

    container.scrollTo({ top: targetY, behavior: "smooth" })

    if (history?.replaceState) {
      history.replaceState(null, "", `#${id}`)
    }
  }

  return (
    <nav aria-label="On this page" className="text-xs text-accent">
      <div className="text-md font-bold text-foreground mb-3">On this page</div>
      <ul className="space-y-1.5 list-none pl-0 m-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                "block py-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md",
                item.level === 3 && "pl-3",
                activeId === item.id && "text-foreground font-medium"
              )}
              aria-current={activeId === item.id ? "location" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
