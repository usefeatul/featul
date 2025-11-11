import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Container } from "@/components/global/container"
import { getCategoryBySlug, getAllCategorySlugs } from "@/types/tools"
import ToolList from "@/components/tools/global/tool-list"
import { createPageMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { buildCategoryItemListSchema, buildCategoryBreadcrumbSchema } from "@/lib/structured-data"
import { getCategoryIntro } from "@/lib/category-intros"
import { JsonLd } from "@/components/global/seo/json-ld"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@feedgot/ui/components/breadcrumb"

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

  const itemListSchema = buildCategoryItemListSchema({
    siteUrl: SITE_URL,
    categorySlug: cat.slug,
    categoryName: cat.name,
    tools: cat.tools,
  })
  const breadcrumbSchema = buildCategoryBreadcrumbSchema({
    siteUrl: SITE_URL,
    categorySlug: cat.slug,
    categoryName: cat.name,
  })
  const intro = getCategoryIntro(cat.slug, cat.name)

  return (
    <main className="min-h-[calc(100vh-64px)] pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-12 sm:py-16" data-component="ToolsCategory">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
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
            <p className="text-accent/80 mt-2">{intro}</p>
            <ToolList categorySlug={cat.slug} tools={cat.tools} />
            <JsonLd id="category-itemlist-jsonld" data={itemListSchema} />
            <JsonLd id="category-breadcrumb-jsonld" data={breadcrumbSchema} />
          </div>
        </section>
      </Container>
    </main>
  )
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }))
}