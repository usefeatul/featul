import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCategoryBySlug, getAllCategorySlugs } from "@/types/tools"
import ToolList from "@/components/tools/global/list"
import ToolsPageShell from "@/components/tools/global/shell"
import { createPageMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { buildToolCategoryBreadcrumbSchema } from "@/lib/schema"
import { serializeJsonLd } from "@/lib/security"
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

  const breadcrumbSchema = buildToolCategoryBreadcrumbSchema({
    siteUrl: SITE_URL,
    categorySlug: category,
    categoryName: cat.name,
  })

  return (
    <ToolsPageShell
      dataComponent="ToolsCategory"
      title={cat.name}
      description={cat.description}
      meta={
        <>
          <script
            id="tool-category-breadcrumb-jsonld"
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
          />
          <Breadcrumb className="mb-2">
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
        </>
      }
    >
      <ToolList categorySlug={cat.slug} tools={cat.tools} />
    </ToolsPageShell>
  )
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }))
}
