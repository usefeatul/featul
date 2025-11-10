"use client"
import { cn } from "@feedgot/ui/lib/utils"
import type { TocItem } from "@/lib/toc"
import { useRef, useState } from "react"
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion"
import { ScrollArea } from "@feedgot/ui/components/scroll-area"
import { useActiveHeading } from "@/hooks/use-active-heading"
import { useAutoScrollActiveLink } from "@/hooks/use-auto-scroll-active-link"
import { scrollToHeading, updateUrlHash } from "@/lib/toc-utils"

type TableOfContentsProps = {
  items: TocItem[]
  className?: string
  title?: string
}

export function TableOfContents({ items, className, title = "Table of content" }: TableOfContentsProps) {
  if (!items?.length) return null
  const activeId = useActiveHeading(items)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const navRef = useRef<HTMLDivElement | null>(null)
  useAutoScrollActiveLink(activeId, expanded, navRef as React.RefObject<HTMLElement>)

  function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    scrollToHeading(id, prefersReducedMotion)
    updateUrlHash(id)
  }
  return (
    <nav
      ref={navRef}
      aria-label="Table of contents"
      className={cn(
        "text-sm text-accent",
        className
      )}
       data-component="TableOfContents"
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
        <ScrollArea className="pr-1 h-[8.75rem]">
          <ul className="space-y-1 list-none pl-0 m-0">
            {items.map((item, i) => (
              <li key={item.id} className={cn("leading-snug text-left")}> 
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onAnchorClick(e, item.id)}
                  className={cn(
                    "block py-1 text-left text-xs text-accent truncate hover:text-primary hover:underline underline-offset-2 decoration-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
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
            className="text-xs text-accent hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </nav>
  )
}