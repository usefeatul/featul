import Link from "next/link";
import { Prose } from "@/components/blog/prose";
import { generateToc } from "@/lib/toc";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { PromoCard } from "@/components/blog/promo-card";
import type { MarblePost } from "@/types/marble";
import { ReadingProgress } from "@/components/blog/reading-progress";

type SinglePostProps = {
  post: MarblePost;
  backHref?: string;
  showBack?: boolean;
};

function estimateReadingTime(html?: string | null) {
  if (!html) return null;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = text.trim().split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function SinglePost({ post }: SinglePostProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const reading = estimateReadingTime(post.content);
  const { html, items } = generateToc(post.content);
  const authorName = post.author?.name ?? post.authors?.[0]?.name ?? null;

  return (
    <article className="py-16 md:py-24">
      <ReadingProgress targetSelector="article" position="bottom" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
        <div className="text-left w-full max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 text-sm text-muted-foreground"
          >
            <Link href="/blog" className=" hover:text-primary">
              Blog
            </Link>
            <span aria-hidden className="mx-1">
              ›
            </span>
            <span className="text-accent break-words">{post.title}</span>
          </nav>

          {/* Title/meta constrained to left column width */}
          <header className="mb-6 text-left">
            <h1 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-tight break-words text-balance">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="text-muted-foreground mt-3">{post.excerpt}</p>
            ) : null}
            {date ? (
              <div className="mt-3 text-xs flex items-center flex-wrap">
                <span className="text-accent">Posted on</span>
                <time
                  className="ml-1 text-primary"
                  dateTime={date.toISOString()}
                >
                  {date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </time>
                {authorName || reading ? (
                  <span className="mx-2 text-zinc-300">•</span>
                ) : null}
                {authorName ? (
                  <span className="text-black dark:text-foreground font-medium">
                    {authorName}
                  </span>
                ) : null}
                {reading ? (
                  <>
                    {authorName ? (
                      <span className="mx-2 text-zinc-300">•</span>
                    ) : null}
                    <span className="text-accent">{reading} min read</span>
                  </>
                ) : null}
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

          {/* Mobile Promo card (always visible) */}
          <div className="mb-8 lg:hidden w-full">
            <PromoCard />
          </div>

          <Prose html={html ?? undefined} />
        </div>

        {/* Right column (ToC + Promo) aligned to top */}
        <aside className="hidden lg:block sticky top-24 h-fit space-y-6">
          {items.length > 0 ? <TableOfContents items={items} /> : null}
          <PromoCard />
        </aside>
      </div>
    </article>
  );
}
