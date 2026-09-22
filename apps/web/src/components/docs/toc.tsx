"use client"

import { cn } from "@featul/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import { useActiveHeading } from "@/hooks/heading"

interface DocsTocProps {
  items: TocItem[]
}

export function DocsToc({ items }: DocsTocProps) {
  const activeId = useActiveHeading(items)

  if (!items?.length) return null

  return (
    <nav aria-label="On this page" className="text-sm">
      <div className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-foreground/45">
        On this page
      </div>
      <ul className="m-0 list-none space-y-0.5 pl-0">
        {items.map((item) => {
          const isH3 = item.level === 3
          const isActive = activeId === item.id

          return (
            <li key={item.id} className={cn(isH3 && "pl-3")}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block py-1 leading-5 transition-colors",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-foreground/50 hover:text-foreground",
                )}
                aria-current={isActive ? "location" : undefined}
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
