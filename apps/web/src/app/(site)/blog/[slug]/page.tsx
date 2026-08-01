import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Container } from "@/components/global/container"
import { SkySection } from "@/components/layout/sky-section"
import { VerticalLines } from "@/components/vertical-lines"
import { getSinglePost } from "@/lib/query"
import type { MarblePostResponse } from "@/types/marble"
import { getPostReadingMinutes, SinglePost } from "@/components/blog/single-post"
import CTA from "@/components/home/cta"
import { createArticleMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { buildBlogPostingSchema, buildBlogBreadcrumbSchema } from "@/lib/structured-data"
import { serializeJsonLd } from "@/lib/security"
import { generateToc } from "@/lib/toc"
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

  const date = post.publishedAt ? new Date(post.publishedAt) : null
  const { html } = generateToc(post.content)
  const reading = getPostReadingMinutes(html)
  const author =
    post.author ??
    (post.authors && post.authors.length > 0 ? post.authors[0] : null)
  const authorName = author?.name ?? null

  return (
    <main className="flex min-h-full flex-1 flex-col overflow-x-clip bg-background">
      <Script
        id="blog-posting-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {serializeJsonLd(buildBlogPostingSchema({ siteUrl: SITE_URL, slug, post }))}
      </Script>
      <Script
        id="blog-breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {serializeJsonLd(buildBlogBreadcrumbSchema({ siteUrl: SITE_URL, slug, title: post.title }))}
      </Script>

      <SkySection
        data-component="BlogPostHero"
        className="min-h-[30vh]"
        contentClassName="flex min-h-[30vh] flex-col justify-end pb-8 pt-24 sm:pb-10 sm:pt-28"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <nav aria-label="Breadcrumb" className="mb-3 text-sm text-foreground/65">
              <Link
                href="/blog"
                className="inline-flex h-8 items-center rounded px-2 -mx-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Blog
              </Link>
              <span aria-hidden className="mx-1">
                ›
              </span>
              <span className="wrap-break-word text-foreground/80">{post.title}</span>
            </nav>

            <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-foreground text-balance wrap-break-words md:text-3xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-3 text-foreground/80">{post.excerpt}</p>
            ) : null}
            {date ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-foreground/65">Posted on</span>
                <time className="text-foreground" dateTime={date.toISOString()}>
                  {date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </time>
                {authorName || reading ? (
                  <span className="mx-1 text-foreground/35">•</span>
                ) : null}
                {author?.image ? (
                  <Image
                    src={author.image}
                    alt={author?.name ?? "Author"}
                    width={20}
                    height={20}
                    className="h-5 w-5 translate-y-[0.5px] rounded-md object-cover"
                  />
                ) : null}
                {authorName ? (
                  <span className="font-medium text-foreground">{authorName}</span>
                ) : null}
                {reading ? (
                  <>
                    {authorName ? (
                      <span className="mx-1 text-foreground/35">•</span>
                    ) : null}
                    <span className="text-foreground/65">{reading} min read</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </SkySection>

      <div className="relative mx-auto w-full max-w-6xl flex-1">
        <VerticalLines force className="absolute inset-0 z-30" />
        <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <SinglePost post={post} showHeader={false} />
          </div>
        </Container>
      </div>
      <CTA />
    </main>
  )
}
