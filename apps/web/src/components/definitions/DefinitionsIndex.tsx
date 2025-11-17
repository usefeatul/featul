import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@/components/global/container"
import type { Definition } from "@/types/definitions"

export default function DefinitionsIndex({ items }: { items: Definition[] }) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-12 sm:py-16" data-component="DefinitionsIndex">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <p className="text-sm text-accent">Glossary • {sorted.length} terms</p>
            <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl mt-4">SaaS Metrics Encyclopedia</h1>
            <p className="text-accent mt-4 max-w-2xl">Short, practical definitions with formulas and examples. Each term links to tools and related concepts.</p>
            <div className="mt-8">
              <div className="space-y-3">
                {sorted.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/definitions/${d.slug}`}
                    className="group flex items-start justify-between gap-4 py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-ring"
                  >
                    <div className="min-w-0">
                      <h3 className="text-[15px] md:text-base font-medium text-foreground truncate">{d.name}</h3>
                      <p className="mt-1 text-sm text-accent line-clamp-2">{d.short}</p>
                    </div>
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-zinc-400 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  )
}