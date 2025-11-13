import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Container } from "@/components/global/container"
import type { Definition } from "@/types/definitions"
import { getDefinitionContent } from "@/types/definitions"

export default function DefinitionDetail({ def }: { def: Definition }) {
  const overview = def.overview ?? `${def.practical} ${def.expert}`
  const full = getDefinitionContent(def)
  const published = def.publishedAt ?? "2025-11-13"
  const publishedDate = new Date(published)
  const publishedLabel = publishedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const author = def.author ?? "Jean Daly"
  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-12 sm:py-16" data-component="DefinitionDetail">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <div className="mb-4 flex items-center gap-3">
              <Link href="/definitions" className="inline-flex items-center gap-1 text-sm text-accent hover:text-primary">
                <ChevronLeft className="size-4" />
                Back
              </Link>
              <span className="text-xs uppercase tracking-wide text-accent/80">Definition</span>
            </div>

            <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
              <div className="space-y-10">
                <div>
                  <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">{def.name}</h1>
                  <p className="text-accent mt-4 max-w-2xl">{def.short}</p>
                </div>
                <section>
                  <h2 className="text-foreground text-lg font-semibold">Overview</h2>
                  <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                    {def.essay?.intro ? <p>{def.essay.intro}</p> : null}
                    <p>{overview}</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-foreground text-lg font-semibold">Definition</h2>
                  <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                    {def.essay?.analysis ? <p>{def.essay.analysis}</p> : null}
                    <p>{full}</p>
                  </div>
                </section>

                {def.formula ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">{def.formula.title}</h2>
                    <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                      <p>{def.formula.body}</p>
                      {def.essay?.formulaContext ? <p>{def.essay.formulaContext}</p> : null}
                    </div>
                    {def.formula.code ? (
                      <pre className="mt-4 rounded-md bg-foreground/5 p-4 text-sm text-foreground whitespace-pre-wrap">{def.formula.code}</pre>
                    ) : null}
                  </section>
                ) : null}

                {def.example ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">{def.example.title}</h2>
                    <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                      <p>{def.example.body}</p>
                      {def.essay?.exampleContext ? <p>{def.essay.exampleContext}</p> : null}
                    </div>
                  </section>
                ) : null}

                {def.pitfalls && def.pitfalls.length ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">Common pitfalls</h2>
                    <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                      {def.essay?.pitfallsContext ? <p>{def.essay.pitfallsContext}</p> : null}
                    </div>
                    <ul className="mt-2 list-disc pl-5 text-accent text-sm sm:text-base leading-7 space-y-1">
                      {def.pitfalls.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {def.benchmarks ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">Benchmarks</h2>
                    <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                      <p>{def.benchmarks}</p>
                      {def.essay?.benchmarksContext ? <p>{def.essay.benchmarksContext}</p> : null}
                    </div>
                  </section>
                ) : null}

                {def.notes && def.notes.length ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">Notes</h2>
                    <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                      {def.essay?.notesContext ? <p>{def.essay.notesContext}</p> : null}
                    </div>
                    <ul className="mt-2 list-disc pl-5 text-accent text-sm sm:text-base leading-7 space-y-1">
                      {def.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {def.related && def.related.length ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">Related terms</h2>
                    <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                      {def.essay?.relatedContext ? <p>{def.essay.relatedContext}</p> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                      {def.related.map((r) => (
                        <Link key={r} href={`/definitions/${r}`} className="text-accent hover:text-primary underline-offset-2 hover:underline">
                          {r}
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}

                {def.faqs && def.faqs.length ? (
                  <section>
                    <h2 className="text-foreground text-lg font-semibold">FAQs</h2>
                    <div className="text-accent mt-4 space-y-4">
                      {def.essay?.faqsContext ? <p className="text-sm sm:text-base leading-7">{def.essay.faqsContext}</p> : null}
                      {def.faqs.map((f, i) => (
                        <div key={i} className="space-y-2">
                          <p className="text-foreground font-medium">{f.q}</p>
                          <p className="text-accent text-sm sm:text-base leading-7">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
              <aside className="mt-6 lg:mt-0 lg:self-start">
                <div className="space-y-2 text-sm text-accent">
                  <p className="text-xs uppercase tracking-wide">Published on</p>
                  <p className="text-foreground">{publishedLabel}</p>
                  <p className="text-xs uppercase tracking-wide mt-4">Written by</p>
                  <p className="text-foreground">{author}</p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </Container>
    </main>
  )
}