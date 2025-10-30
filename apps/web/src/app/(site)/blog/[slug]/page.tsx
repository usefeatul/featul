import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { getSinglePost } from "@/lib/query"
import type { MarblePostResponse } from "@/types/marble"
import { SinglePost } from "@/components/single-post"
import CTA from "@/components/cta"



export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const res = (await getSinglePost(slug)) as MarblePostResponse | undefined
  const post = res?.post
  if (!post) return { title: "Post not found" }
  return {
    title: post.title,
    description: post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const res = (await getSinglePost(slug)) as MarblePostResponse | undefined
  const post = res?.post
  if (!post) return notFound()


  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <SinglePost post={post} />
      </Container>
        <CTA/>
    </main>
  )
}