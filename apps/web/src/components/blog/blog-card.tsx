import Link from "next/link";
import type { MarblePost } from "@/types/marble";
import { Card, CardContent } from "@feedgot/ui/components/card";

type BlogCardProps = {
  post: MarblePost;
};

export function BlogCard({ post }: BlogCardProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const author =
    post.author ??
    (post.authors && post.authors.length > 0 ? post.authors[0] : null);
  const avatarSrc = author?.image ?? "";
  const toPlain = (s?: string | null) => (s ? s.replace(/<[^>]+>/g, " ") : "");
  const words = `${toPlain(post.content)} ${toPlain(post.excerpt)}`
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const readMinutes = words.length
    ? Math.max(1, Math.round(words.length / 200))
    : null;
  const tagNames = (post.tags ?? [])
    .map((t: any) => (typeof t === "string" ? t : t?.name))
    .filter(Boolean) as string[];
  const categoryName = post.category?.name ?? null;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full"
      prefetch={false}
    >
      <Card className="h-full overflow-hidden border flex flex-col transition-colors hover:bg-muted/20">
        {post.coverImage ? (
          <div className="aspect-[16/9] w-full relative">
            <img
              src={post.coverImage ?? ""}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : null}
        <CardContent className="p-5 flex-1 flex flex-col">
          {(categoryName || tagNames.length > 0) ? (
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="inline-flex w-fit items-center rounded-sm border border-border bg-primary/70 px-2 py-[2px] text-xs text-black">
                  {categoryName}
                </span>
              )}
              {tagNames.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex w-fit items-center rounded-sm border border-border/60 bg-muted px-2 py-[2px] text-xs text-black"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={author?.name ?? "Author"}
                className="h-5 w-5 rounded-full object-cover translate-y-[0.5px]"
              />
            ) : null}
            {author?.name ? (
              <span className="text-xs text-primary">
                {author.name}
              </span>
            ) : null}
            {date ? (
              <span className="text-xs text-accent">
                {date.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ) : (
              <span className="text-xs text-accent">Latest</span>
            )}
            {readMinutes ? (
              <>
                <span className="mb-1 text-zinc-300">•</span>
                <span className="text-xs text-accent">
                  {readMinutes} min read
                </span>
              </>
            ) : null}
          </div>

          <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="text-accent mt-2 text-sm line-clamp-2">
              {post.excerpt}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
