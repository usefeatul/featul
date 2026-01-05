import type { TocItem } from "@/lib/toc"
import { TableOfContents } from "@/components/blog/table-of-contents"

interface DocsTocProps {
  items: TocItem[]
}

export function DocsToc({ items }: DocsTocProps) {
  return (
    <TableOfContents
      title="On this page"
      items={items}
      className="text-xs"
      scrollContainerSelector='[data-docs-scroll-container="true"]'
    />
  )
}

