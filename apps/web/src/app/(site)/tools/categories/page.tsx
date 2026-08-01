import type { Metadata } from "next"
import CategoryList from "@/components/tools/global/category-list"
import ToolsPageShell from "@/components/tools/global/tool-shell"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "All Tool Categories - Revenue, retention, feedback",
  description: "Browse tool categories including revenue, retention, and customer feedback calculators.",
  path: "/tools/categories",
})

export default function ToolsCategoriesPage() {
  return (
    <ToolsPageShell
      title="Categories"
      description="Find calculators and templates grouped by topic."
    >
      <CategoryList />
    </ToolsPageShell>
  )
}
