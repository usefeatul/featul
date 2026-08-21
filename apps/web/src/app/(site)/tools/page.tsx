import type { Metadata } from "next"
import { TOOL_CATEGORIES } from "@/types/tools"
import CategoryList from "@/components/tools/global/categories"
import ToolsPageShell from "@/components/tools/global/shell"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Free Feedback, Roadmap & Changelog Tools",
  description:
    "Free calculators for feature voting, RICE prioritization, public roadmaps, and changelog writing—plus SaaS metrics for product teams.",
  path: "/tools",
})

export default function ToolsIndexPage() {
  const totalTools = TOOL_CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)
  return (
    <ToolsPageShell
      dataComponent="ToolsIndex"
      eyebrow={`Free tools • ${totalTools} calculators`}
      title="Free tools for feedback, roadmaps, and changelogs"
      description="Prioritize votes, plan a public roadmap, and write release notes. Also includes SaaS calculators for growth and finance."
    >
      <CategoryList />
    </ToolsPageShell>
  )
}
