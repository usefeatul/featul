import Link from "next/link"
import { cn } from "@feedgot/ui/lib/utils"
import type { TocItem } from "@/lib/toc"

type TableOfContentsProps = {
  items: TocItem[]
  className?: string
  title?: string
}

export function TableOfContents({ items, className, title = "On this page" }: TableOfContentsProps) {
  if (!items?.length) return null
  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "text-sm text-zinc-500 max-h-[75vh] overflow-auto",
        className
      )}
    >
      <div className="text-xs text-zinc-500 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className={cn("leading-snug", item.level === 3 && "pl-4")}> 
            <Link
              href={`#${item.id}`}
              className={cn(
                "block py-1 text-zinc-500 hover:text-foreground",
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