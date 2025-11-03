import type { Metadata } from "next"
import { Container } from "@/components/global/container"
import { TOOL_CATEGORIES } from "@/types/tools"
import CategoryList from "@/components/tools/category-list"



export const metadata: Metadata = {
  title: "SaaS Calculators & Tools",
  description: "Practical calculators for product, growth, and finance decisions.",
}

export default function ToolsIndexPage() {
  const totalTools = TOOL_CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)
  return (
    <main className="min-[height:calc(100vh-64px)]  pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-12 sm:py-16">
          <p className="text-sm text-zinc-500">Growth tools • {totalTools} calculators</p>
          <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl mt-2">Practical SaaS calculators for clear, data‑led decisions</h1>
          <p className="text-zinc-500 mt-4 max-w-2xl">Calculate core SaaS metrics including MRR, CAC, LTV, churn, and runway.</p>
          <CategoryList />
        </section>
      </Container>
    </main>
  )
}