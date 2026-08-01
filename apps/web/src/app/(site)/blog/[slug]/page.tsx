import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { SkyPageShell } from "@/components/layout/sky-page-shell"
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
    <>
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

      <SkyPageShell
        dataComponent="BlogPost"
        title={post.title}
        description={post.excerpt}
        meta={
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-accent">
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
        }
      >
        {date ? (
          <div className="-mt-4 mb-8 flex flex-wrap items-center gap-2 text-xs text-accent">
            <span>Posted on</span>
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
                <span>{reading} min read</span>
              </>
            ) : null}
          </div>
        ) : null}
        <SinglePost post={post} showHeader={false} />
      </SkyPageShell>
      <CTA />
    </>
  )
}
