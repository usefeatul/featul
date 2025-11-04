import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Container } from "@/components/global/container"
import { getCategoryBySlug, getToolBySlugs, getAllToolParams } from "@/types/tools"
import { TOOL_COMPONENTS } from "@/types/registry"
import ToolTemplate from "@/components/tools/global/template"


type Props = { params: Promise<{ category: string; tool: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, tool: toolSlug } = await params
  const cat = getCategoryBySlug(category)
  const tool = getToolBySlugs(category, toolSlug)
  if (!cat || !tool) return { title: "Tool" }
  return {
    title: tool.name,
    description: tool.description,
  }
}
 
export default async function ToolPage({ params }: Props) {
  const { category, tool: toolSlug } = await params
  const tool = getToolBySlugs(category, toolSlug)
  if (!tool) return notFound()
  const ToolComponent = TOOL_COMPONENTS[category]?.[toolSlug]

  return (
    <main className="min-h-screen pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-12 sm:py-16">
          {/* Breadcrumb removed for a cleaner tool detail page. */}
          {/* Page-level title and description omitted to avoid duplication; the tool component provides its own content. */}
          {ToolComponent ? <ToolComponent /> : <ToolTemplate tool={tool} />}
        </section>
      </Container>
    </main>
  )
}

export function generateStaticParams() {
  return getAllToolParams()
}