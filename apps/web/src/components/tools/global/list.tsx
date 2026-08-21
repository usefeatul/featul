import Link from 'next/link'
import type { ToolItem } from '@/types/tools'
import { isToolNew } from '@/config/toolsFlags'
import { ChevronRight } from 'lucide-react'
import {
  OverlayCard,
  OverlayCardPanel,
} from '@/components/shared/overlay-card'

export default function ToolList({ categorySlug, tools }: { categorySlug: string; tools: ToolItem[] }) {
  return (
    <div className="mt-8 space-y-3">
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/tools/categories/${categorySlug}/${tool.slug}`}
          className="group block"
        >
          <OverlayCard>
            <OverlayCardPanel className="flex items-start justify-between gap-4 px-3 py-3 sm:px-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-medium text-foreground md:text-base">{tool.name}</h3>
                  {(tool.isNew || isToolNew(tool.slug)) && (
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/20 px-1 py-0.5 text-xs font-medium text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/15">
                      NEW
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-accent">{tool.description}</p>
              </div>
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-zinc-400 transition-colors group-hover:text-primary" />
            </OverlayCardPanel>
          </OverlayCard>
        </Link>
      ))}
    </div>
  )
}
