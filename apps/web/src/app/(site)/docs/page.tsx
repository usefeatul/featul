import type { Metadata } from "next"
import Link from "next/link"
import { docsSections } from "@/config/docsNav"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Documentation",
  description:
    "Documentation, guides, and technical reference for Featul — feedback boards, roadmaps, changelogs, and the in-app widget.",
  path: "/docs",
})

export default function DocsIndexPage() {
  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.15rem]">
          Docs
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-foreground/55">
          Documentation, guides, and technical reference for Featul.
        </p>
      </header>

      <div className="space-y-12">
        {docsSections.map((section) => (
          <section key={section.label}>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {section.label}
            </h2>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => (
                <li key={item.href} className="border-b border-border">
                  <Link
                    href={item.href}
                    className="block py-3 text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
