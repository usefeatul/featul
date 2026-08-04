import type { Metadata } from "next"
import { getAllUseCasesForIndex } from "@/types/scenarios"
import UseCaseCardList from "@/components/use-cases/global/cards"
import { SkyPageShell } from "@/components/layout/shell"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Use Cases for Product Feedback & Roadmaps",
  description:
    "Explore practical use cases for Featul, from centralizing product feedback to running a transparent public roadmap and changelog.",
  path: "/use-cases",
})

export default function UseCasesIndexPage() {
  const totalUseCases = getAllUseCasesForIndex().length
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
