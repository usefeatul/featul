import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/global/container"
import { getSinglePost } from "@/lib/query"
import type { MarblePostResponse } from "@/types/marble"
import { SinglePost } from "@/components/blog/single-post"
import CTA from "@/components/home/cta"
import { createArticleMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"



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


  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <SinglePost post={post} />
        </div>
      </Container>
        <CTA/>
    </main>
  )
}
