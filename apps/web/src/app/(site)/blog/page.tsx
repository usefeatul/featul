import type { Metadata } from "next";
import { Container } from "@/components/global/container";
import { getPosts } from "@/lib/query";
import { BlogCard } from "@/components/blog/blog-card";
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
    <main className="min-h-screen bg-background pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <section className="py-10 md:py-14">
          <div className="mx-auto w-full max-w-[1040px] px-0 sm:px-4">
            <div className="max-w-[340px] sm:max-w-[620px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Journal
              </p>
              <h1 className="mt-2 font-serif text-[2.55rem] leading-none tracking-[-0.04em] text-foreground md:text-[3.15rem]">
                Blog
              </h1>
              <p className="mt-3 max-w-[32ch] text-base leading-7 text-accent sm:max-w-lg sm:text-[1.08rem]">
                Thoughts, product notes, and quiet updates on building clearer
                customer feedback software.
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="mt-10 max-w-3xl text-sm text-muted-foreground">
                No posts yet. Connect Marble or add content to your workspace.
              </div>
            ) : (
              <div className="mt-10 grid max-w-[700px] grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
