import type { Metadata } from "next"
import { Container } from "@/components/global/container"
import { USE_CASES } from "@/types/use-cases"
import UseCaseCardList from "@/components/use-cases/global/use-case-card-list"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Use Cases - How teams use featul for product feedback",
  description:
    "Explore practical use cases for featul, from centralizing product feedback to running a transparent public roadmap and changelog.",
  path: "/use-cases",
})

export default function UseCasesIndexPage() {
  const totalUseCases = USE_CASES.length
  return (
    <main className="min-[height:calc(100vh-64px)] pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-12 sm:py-16" data-component="UseCasesIndex">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <p className="text-sm text-accent">
              Use cases • {totalUseCases} guide{totalUseCases > 1 ? "s" : ""}
            </p>
            <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl mt-4">
              See how teams actually use featul
            </h1>
            <p className="text-accent mt-4 max-w-2xl">
              Scenario-based guides that show how product-led teams centralize
              feedback, align on roadmaps, and keep customers in the loop.
            </p>
            <UseCaseCardList />
          </div>
        </section>
      </Container>
    </main>
  )
}
