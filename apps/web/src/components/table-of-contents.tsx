"use client"
import Link from "next/link"
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
  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "text-sm text-zinc-500 max-h-[75vh] overflow-auto",
        className
      )}
    >
      <div className="text-md font-bold text-foreground mb-2">{title}</div>
      <ul className="space-y-1 list-none pl-0 m-0">
        {items.map((item, i) => (
          <li key={item.id} className={cn("leading-snug text-left")}> 
            <Link
              href={`#${item.id}`}
              className={cn(
                "block py-1 text-left text-zinc-500 hover:text-primary hover:underline underline-offset-2 decoration-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
                item.level === 2 ? "font-medium" : "font-normal",
                activeId === item.id && "text-primary font-semibold"
              )}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              <span className="mr-2 tabular-nums">{i + 1}.</span>
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}