import Link from "next/link";
import Image from "next/image";
import type { MarblePost } from "@/types/marble";
import {
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

type BlogCardProps = {
  post: MarblePost;
};

export function BlogCard({ post }: BlogCardProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full w-full flex-col"
      prefetch={false}
    >
      <article className={cn(modalCardShellClass, "flex min-h-full flex-col")}>
        <header className="flex items-center justify-between gap-3 px-2.5 py-1.5">
          <span className="truncate text-sm font-medium leading-6 text-foreground">
            {post.category?.name ?? "Blog"}
          </span>
          <time
            dateTime={date?.toISOString()}
            className="shrink-0 text-[13px] text-accent"
          >
            {date
              ? date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Latest"}
          </time>
        </header>

        <div className={cn(modalCardInnerClass, "flex flex-1 flex-col")}>
          <div className="relative aspect-[16/11] shrink-0 overflow-hidden bg-primary/10">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={`${post.title} – blog post cover`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/zOzs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg=="
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : null}
          </div>

          <div className="flex flex-1 flex-col border-t border-border/40 px-4 py-3">
            <h2 className="line-clamp-3 min-h-[4.125em] font-heading text-[1.05rem] font-medium leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-foreground/75 sm:text-[1.15rem]">
              {post.title}
            </h2>
          </div>
        </div>
      </article>
    </Link>
  );
}
