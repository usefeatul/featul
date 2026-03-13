import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/global/container"
import { getSinglePost } from "@/lib/query"
import type { MarblePostResponse } from "@/types/marble"
import { SinglePost } from "@/components/blog/single-post"
import CTA from "@/components/home/cta"
import { createArticleMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { buildBlogPostingSchema, buildBlogBreadcrumbSchema } from "@/lib/structured-data"
import Script from "next/script"

export const revalidate = 30



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const res = (await getSinglePost(slug)) as MarblePostResponse | undefined
  const post = res?.post
  if (!post) return { title: "Post not found" }
  return createArticleMetadata({
    title: post.title,
    description: post.excerpt || post.title,
    path: `/blog/${slug}`,
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = (await getSinglePost(slug)) as MarblePostResponse | undefined
  const post = res?.post
  if (!post) return notFound()

  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <Script
            id="blog-posting-jsonld"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogPostingSchema({ siteUrl: SITE_URL, slug, post })) }}
          />
          <Script
            id="blog-breadcrumb-jsonld"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogBreadcrumbSchema({ siteUrl: SITE_URL, slug, title: post.title })) }}
          />
          <SinglePost post={post} />
        </div>
      </Container>
      <CTA />
    </main>
  )
}
