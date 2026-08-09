"use client"

import { cn } from "@featul/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import { useActiveHeading } from "@/hooks/heading"

interface DocsTocProps {
  items: TocItem[]
}

export function DocsToc({ items }: DocsTocProps) {
  const activeId = useActiveHeading(items, '[data-docs-scroll-container="true"]')

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
      <ul className="list-none pl-0 m-0 space-y-0">
        {items.map((item) => {
          const isH3 = item.level === 3

          return (
            <li key={item.id} className={cn(isH3 && "pl-3")}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "block py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md",
                  activeId === item.id && "text-foreground font-medium"
                )}
                aria-current={activeId === item.id ? "location" : undefined}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
