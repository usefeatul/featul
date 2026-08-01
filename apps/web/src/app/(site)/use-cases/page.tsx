import type { Metadata } from "next"
import { USE_CASES } from "@/types/use-cases"
import UseCaseCardList from "@/components/use-cases/global/use-case-card-list"
import { SkyPageShell } from "@/components/layout/sky-page-shell"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Use Cases for Product Feedback & Roadmaps",
  description:
    "Explore practical use cases for Featul, from centralizing product feedback to running a transparent public roadmap and changelog.",
  path: "/use-cases",
})

export default function UseCasesIndexPage() {
  const totalUseCases = USE_CASES.length
  return (
    <SkyPageShell
      dataComponent="UseCasesIndex"
      eyebrow={`Use cases • ${totalUseCases} guide${totalUseCases > 1 ? "s" : ""}`}
      title="See how teams actually use Featul"
      description="Scenario-based guides that show how product-led teams centralize feedback, align on roadmaps, and keep customers in the loop."
    >
      <UseCaseCardList />
    </SkyPageShell>
  )
}
