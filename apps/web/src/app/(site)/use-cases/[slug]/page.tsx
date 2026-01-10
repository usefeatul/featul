import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/global/container"
import { getUseCaseBySlug, getAllUseCaseSlugs } from "@/types/use-cases"
import { USE_CASE_COMPONENTS } from "@/types/use-case-registry"
import { createArticleMetadata } from "@/lib/seo"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@featul/ui/components/breadcrumb"
import { UseCaseHowToJsonLd } from "@/components/seo/UseCaseHowToJsonLd"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  if (!useCase) return { title: "Use Case" }
  return createArticleMetadata({
    title: `Use case: ${useCase.name}`,
    description: useCase.description,
    path: `/use-cases/${slug}`,
  })
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  if (!useCase) return notFound()

  const UseCaseComponent = USE_CASE_COMPONENTS[slug]

  return (
    <main className="min-h-screen pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-12 sm:py-16" data-component="UseCaseDetail">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <Breadcrumb className="mb-6">
              <BreadcrumbList className="text-accent">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/use-cases"
                      className="inline-flex h-8 items-center px-2"
                    >
                      Use cases
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{useCase.badge}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <UseCaseHowToJsonLd />
            {UseCaseComponent ? (
              <UseCaseComponent />
            ) : (
              <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
                <p>Coming soon.</p>
              </div>
            )}
          </div>
        </section>
      </Container>
    </main>
  )
}

export function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }))
}
