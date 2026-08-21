import Link from 'next/link'
import { TOOL_CATEGORIES } from '@/types/tools'
import { CornerUpRight } from 'lucide-react'
import { getCategoryIcon } from './icons'
import {
  OverlayCard,
  OverlayCardPanel,
} from '@/components/shared/overlay-card'

export default function CategoryList() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_CATEGORIES.map((cat) => {
        const Icon = getCategoryIcon(cat.slug)
        return (
          <Link key={cat.slug} href={`/tools/categories/${cat.slug}`} className="group block h-full">
            <OverlayCard>
              <OverlayCardPanel className="flex h-full flex-col px-4 py-3 sm:px-5 sm:py-4">
                <Icon className="mb-3 size-5 text-black group-hover:text-primary" />
                <h3 className="text-lg font-medium text-foreground">{cat.name}</h3>
                <p className="mt-1 flex-1 text-sm leading-6 text-accent">{cat.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {cat.tools.length} tools
                  </span>
                  <span className="inline-flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explore
                    <CornerUpRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </OverlayCardPanel>
            </OverlayCard>
          </Link>
        )
      })}
    </div>
  )
}
