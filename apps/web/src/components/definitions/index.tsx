import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SkyPageShell } from "@/components/layout/sky-page-shell"
import type { Definition } from "@/types/definitions"

export default function DefinitionsIndex({ items }: { items: Definition[] }) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <SkyPageShell
      dataComponent="DefinitionsIndex"
      eyebrow={`Glossary • ${sorted.length} terms`}
      title="SaaS Metrics Encyclopedia"
      description="Short, practical definitions with formulas and examples. Each term links to tools and related concepts."
    >
      <div className="space-y-3">
        {sorted.map((d) => (
          <Link
            key={d.slug}
            href={`/definitions/${d.slug}`}
            className="group flex items-start justify-between gap-4 rounded-md px-2.5 py-2.5 transition-colors focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-3 sm:py-3"
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-foreground md:text-base">{d.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-accent">{d.short}</p>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-zinc-400 transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </SkyPageShell>
  )
}
