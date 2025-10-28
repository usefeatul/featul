import type { Metadata } from "next"
import { Container } from "@/components/container"

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, updates, and engineering stories from the team.",
}

export default function BlogPage() {
  return (
    <main className="min-h-screen pt-16">
      <Container maxWidth="6xl">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
            <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Blog</h1>
            <p className="text-muted-foreground mt-4">Latest articles and announcements.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 px-4 md:px-6 sm:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-6">
              <span className="text-xs text-muted-foreground">Coming soon</span>
              <h2 className="mt-2 text-lg font-semibold">Building with AI-first workflows</h2>
              <p className="text-muted-foreground mt-2">How we approach developer experience and reliability.</p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6">
              <span className="text-xs text-muted-foreground">Coming soon</span>
              <h2 className="mt-2 text-lg font-semibold">Scaling your code review pipeline</h2>
              <p className="text-muted-foreground mt-2">Patterns for fast, consistent reviews with automation.</p>
            </article>
          </div>
        </section>
      </Container>
    </main>
  )
}