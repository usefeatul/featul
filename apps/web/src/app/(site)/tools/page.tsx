import type { Metadata } from "next"
import { Container } from "@/components/container"
import CategoryList from "@/components/tools/category-list"



export const metadata: Metadata = {
  title: "Free Tools by Category",
  description: "Browse calculators and templates organized by revenue, retention, and feedback categories.",
}

export default function ToolsIndexPage() {
  return (
    <main className="min-h-[70vh] pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-12 sm:py-16">
          <h1 className="text-balance font-serif text-3xl font-bold md:text-4xl lg:text-5xl">Tools</h1>
          <p className="text-zinc-500 mt-4 max-w-2xl">Explore 30+ tools soon — organized in clear categories to help you find the right calculator or template fast.</p>
          <CategoryList />
        </section>
      </Container>
    </main>
  )
}