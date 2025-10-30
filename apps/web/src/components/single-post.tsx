import Link from "next/link"
import { Prose } from "@/components/prose"
import { generateToc } from "@/lib/toc"
import { TableOfContents } from "@/components/table-of-contents"
import { PromoCard } from "@/components/promo-card"
import type { MarblePost } from "@/types/marble"

type SinglePostProps = {
  post: MarblePost
  backHref?: string
  showBack?: boolean
}

function estimateReadingTime(html?: string | null) {
  if (!html) return null
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
  const words = text.trim().split(" ").filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function SinglePost({ post, backHref = "/blog", showBack = true }: SinglePostProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null
  const reading = estimateReadingTime(post.content)
  const { html, items } = generateToc(post.content)

  return (
    <article className="py-16 md:py-24">
      {/* Start grid from the very top so ToC aligns with Back button */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
        {/* Left column */}
        <div className="text-left w-full max-w-3xl">

          {/* Breadcrumb for subtle context */}
          <nav aria-label="Breadcrumb" className="mb-3 text-md text-muted-foreground">
            <Link href="/blog" className=" hover:text-primary">Blog</Link>
            <span aria-hidden className="mx-1">›</span>
            <span className="text-foreground/80 break-words">{post.title}</span>
          </nav>

          {/* Title/meta constrained to left column width */}
          <header className="mb-6 text-left">
            <h1 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-tight break-words text-balance">{post.title}</h1>
            {post.excerpt ? <p className="text-muted-foreground mt-3">{post.excerpt}</p> : null}
            {date ? (
              <div className="text-xs text-muted-foreground mt-3">
                <time dateTime={date.toISOString()}>
                  {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </time>
                {reading ? <span> • {reading} min read</span> : null}
              </div>
            ) : null}
          </header>

          {post.coverImage ? (
            <div className="mb-8 overflow-hidden rounded-lg border w-full">
              <img
                src={post.coverImage}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ) : null}

          {/* Mobile ToC at the start of content (after image) */}
          {items.length > 0 ? (
            <div className="mb-8 lg:hidden w-full">
              <TableOfContents items={items} />
            </div>
          ) : null}

          {/* Mobile promo card under ToC */}
          <div className="lg:hidden mb-8 w-full">
            <PromoCard />
          </div>

          <Prose html={html ?? undefined} />
        </div>

        {/* Right column ToC aligned with very top */}
        {items.length > 0 ? (
          <aside className="hidden lg:block sticky top-24 h-fit">
            <TableOfContents items={items} />
            <PromoCard className="mt-6" />
          </aside>
        ) : null}
      </div>
    </article>
  )
}