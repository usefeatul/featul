import type { Metadata } from "next"
import { TOOL_CATEGORIES } from "@/types/tools"
import CategoryList from "@/components/tools/global/categories"
import ToolsPageShell from "@/components/tools/global/shell"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "SaaS Calculators & Tools",
  description: "Practical calculators for product, growth, and finance decisions.",
  path: "/tools",
})

export default function ToolsIndexPage() {
  const totalTools = TOOL_CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)
  return (
    <ToolsPageShell
      dataComponent="ToolsIndex"
      eyebrow={`Growth tools • ${totalTools} calculators`}
      title="Practical SaaS calculators for clear, data‑led decisions"
      description="Calculate core SaaS metrics including MRR, CAC, LTV, churn, and runway."
    >
      <CategoryList />
    </ToolsPageShell>
  )
}
