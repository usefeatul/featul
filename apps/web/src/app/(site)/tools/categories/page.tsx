import type { Metadata } from "next"
import { Container } from "@/components/global/container"
import CategoryList from "@/components/tools/global/category-list"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "All Tool Categories — Revenue, retention, feedback",
  description: "Browse tool categories including revenue, retention, and customer feedback calculators.",
  path: "/tools/categories",
})

export default function ToolsCategoriesPage() {
  return (
    <main className="min-[height:calc(100vh-64px)] pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <h1 className="text-balance text-3xl font-bold md:text-4xl">Categories</h1>
            <p className="text-accent mt-4">Find calculators and templates grouped by topic.</p>
            <CategoryList />
          </div>
        </section>
      </Container>
    </main>
  )
}