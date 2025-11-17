import type { Metadata } from "next"
import { Container } from "@/components/global/container"
import { TOOL_CATEGORIES } from "@/types/tools"
import CategoryList from "@/components/tools/global/category-list"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "SaaS Calculators & Tools",
  description: "Practical calculators for product, growth, and finance decisions.",
  path: "/tools",
})

export default function ToolsIndexPage() {
  const totalTools = TOOL_CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)
  return (
    <main className="min-[height:calc(100vh-64px)]  pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-12 sm:py-16" data-component="ToolsIndex">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <p className="text-sm text-accent ">Growth tools • {totalTools} calculators</p>
            <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl mt-4">Practical SaaS calculators for clear, data‑led decisions</h1>
            <p className="text-accent mt-4 max-w-2xl">Calculate core SaaS metrics including MRR, CAC, LTV, churn, and runway.</p>
            <CategoryList />
          </div>
        </section>
      </Container>
    </main>
  )
}