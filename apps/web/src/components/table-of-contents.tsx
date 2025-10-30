import Link from "next/link"
import { cn } from "@feedgot/ui/lib/utils"
import type { TocItem } from "@/lib/toc"

type TableOfContentsProps = {
  items: TocItem[]
  className?: string
  title?: string
}

export function TableOfContents({ items, className, title = "Table of content" }: TableOfContentsProps) {
  if (!items?.length) return null
  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "text-sm text-zinc-500 max-h-[75vh] overflow-auto",
        className
      )}
    >
      <div className="text-xs font-bold text-foreground mb-2">{title}</div>
      <ul className="space-y-1 list-none pl-0 m-0">
        {items.map((item) => (
          <li key={item.id} className={cn("leading-snug text-left")}> 
            <Link
              href={`#${item.id}`}
              className={cn(
                "block py-1 text-left text-zinc-500 hover:text-primary hover:underline underline-offset-2 decoration-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm",
                item.level === 2 ? "font-medium" : "font-normal"
              )}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}