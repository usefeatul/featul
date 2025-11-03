import type { Metadata } from "next"
import { Container } from "@/components/global/container"
import { getPosts } from "@/lib/query"
import { BlogCard } from "@/components/blog/blog-card"
import type { MarblePostListResponse } from "@/types/marble"

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, updates, and engineering stories from the team.",
}

export default async function BlogPage() {
  const res = (await getPosts()) as MarblePostListResponse | undefined
  const posts = res?.posts ?? []
  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Blog</h1>
            <p className="text-zinc-500 mt-4">Notes on Feedgot's journey empowering actionable customer feedback.</p>
          </div>

          {posts.length === 0 ? (
            <div className="mx-auto max-w-3xl mt-12 text-center text-sm text-muted-foreground">
              No posts yet. Connect Marble or add content to your workspace.
            </div>
          ) : (
            <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  )
}