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
    <ToolsPageShell mainClassName="min-[height:calc(100vh-64px)] pt-16">
      <h1 className="text-balance text-3xl font-bold md:text-4xl">Categories</h1>
      <p className="text-accent mt-4">Find calculators and templates grouped by topic.</p>
      <CategoryList />
    </ToolsPageShell>
  )
}
