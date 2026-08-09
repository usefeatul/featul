import Link from "next/link";
import Image from "next/image";
import type { MarblePost } from "@/types/marble";

type BlogCardProps = {
  post: MarblePost;
};

export function BlogCard({ post }: BlogCardProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full w-full"
      prefetch={false}
    >
      <article className="flex h-full flex-col rounded-md border border-foreground/10 bg-card p-3 sm:p-4">
        <div className="flex aspect-[16/11] items-center justify-center overflow-hidden rounded-md bg-primary p-3 sm:p-4">
          {post.coverImage ? (
            <div className="relative h-full w-full overflow-hidden rounded-md bg-card">
              <Image
                src={post.coverImage}
                alt={`${post.title} – blog post cover`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/7Ozs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg=="
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-end rounded-md bg-card p-4">
              {post.category?.name ? (
                <span className="rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                  {post.category.name}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-0.5 pb-0.5 pt-4">
          <h2 className="line-clamp-3 font-heading text-[1.05rem] font-medium leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-foreground/75 sm:text-[1.15rem]">
            {post.title}
          </h2>
          <p className="mt-2 text-[13px] text-accent">
            {date
              ? date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Latest"}
          </p>
        </div>
      </article>
    </Link>
  );
}
