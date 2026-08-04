import type { Metadata } from "next";
import { SkyPageShell } from "@/components/layout/shell";
import { getPosts } from "@/lib/query";
import { BlogCard } from "@/components/blog/card";
import type { MarblePostListResponse } from "@/types/marble";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 30;

export const metadata: Metadata = createPageMetadata({
  title: "Product Feedback & Roadmap Blog",
  description:
    "Essays on customer‑driven development, alignment, and shipping with clarity.",
  path: "/blog",
});

export default async function BlogPage() {
  const res = (await getPosts()) as MarblePostListResponse | undefined;
  const posts = res?.posts ?? [];
  return (
    <SkyPageShell
      dataComponent="BlogIndex"
      eyebrow="Journal"
      title="Blog"
      description="Thoughts, product notes, and quiet updates on building clearer customer feedback software."
      headerClassName="max-w-[620px]"
    >
      {posts.length === 0 ? (
        <div className="max-w-3xl text-sm text-muted-foreground">
          No posts yet. Connect Marble or add content to your workspace.
        </div>
      ) : (
        <div className="grid max-w-[700px] grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </SkyPageShell>
  );
}
