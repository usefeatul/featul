import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCategoryBySlug, getAllCategorySlugs } from "@/types/tools"
import ToolList from "@/components/tools/global/tool-list"
import ToolsPageShell from "@/components/tools/global/tool-shell"
import { createPageMetadata } from "@/lib/seo"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@featul/ui/components/breadcrumb"

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) return { title: "Tools Category" }
  return createPageMetadata({
    title: `${cat.name} Tools`,
    description: cat.description,
    path: `/tools/categories/${category}`,
  })
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) return notFound()

  return (
    <ToolsPageShell
      dataComponent="ToolsCategory"
      mainClassName="min-h-[calc(100vh-64px)] pt-16 bg-background"
    >
      <Breadcrumb className="mb-6">
        <BreadcrumbList className="text-accent">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tools" className="inline-flex h-8 items-center px-2">Tools</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tools/categories" className="inline-flex h-8 items-center px-2">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{cat.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-balance text-3xl font-bold md:text-4xl">{cat.name}</h1>
      <p className="text-accent mt-4">{cat.description}</p>
      <ToolList categorySlug={cat.slug} tools={cat.tools} />
    </ToolsPageShell>
  )
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }))
}
