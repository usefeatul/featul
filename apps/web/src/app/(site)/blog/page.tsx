import type { Metadata } from "next"
import { Container } from "@/components/global/container"
import { getPosts } from "@/lib/query"
import { BlogCard } from "@/components/blog/blog-card"
import type { MarblePostListResponse } from "@/types/marble"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata: Metadata = createPageMetadata({
  title: "Blog — Product leadership, feedback, and building in public",
  description: "Essays on customer‑driven development, alignment, and shipping with clarity.",
  path: "/blog",
})

export default async function BlogPage() {
  const res = (await getPosts()) as MarblePostListResponse | undefined
  const posts = res?.posts ?? []
  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <div className="text-center">
              <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Blog</h1>
              <p className="text-accent mt-4">Notes on Feedgot's journey empowering actionable customer feedback.</p>
            </div>

            {posts.length === 0 ? (
              <div className="max-w-3xl mt-12 text-center text-sm text-muted-foreground">
                No posts yet. Connect Marble or add content to your workspace.
              </div>
            ) : (
              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </Container>
    </main>
  )
}