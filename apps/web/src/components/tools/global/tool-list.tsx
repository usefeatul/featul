import Link from 'next/link'
import type { ToolItem } from '@/types/tools'
import { isToolNew } from '@/config/toolsFlags'
import { ChevronRight } from 'lucide-react'

export default function ToolList({ categorySlug, tools }: { categorySlug: string; tools: ToolItem[] }) {
  return (
    <div className="mt-8">
      <div className="space-y-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/categories/${categorySlug}/${tool.slug}`}
            className="group flex items-start justify-between gap-4 py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-md  transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-ring"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] md:text-base font-medium text-foreground truncate">{tool.name}</h3>
                {(tool.isNew || isToolNew(tool.slug)) && (
                  <span className="inline-flex items-center gap-1.5 rounded-md  px-1 py-0.5 text-[10px] font-medium bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary/15 group-hover:border-primary/40 transition-colors">
                    NEW
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-accent line-clamp-2">{tool.description}</p>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-zinc-400 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}