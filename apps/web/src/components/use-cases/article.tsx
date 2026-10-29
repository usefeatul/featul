import Link from "next/link"
import { SITE_URL } from "@/config/seo"
import type { UseCaseArticle } from "@/content/use-cases"
import { buildUseCasesBreadcrumbSchema } from "@/lib/schema"
import { serializeJsonLd } from "@/lib/security";
import { UseCaseDetailShell } from "@/components/use-cases/shell"

/** Renders a hand-written use case article from `@/content/use-cases`. */
export function UseCaseArticleView({ article }: { article: UseCaseArticle }) {
  const breadcrumbSchema = buildUseCasesBreadcrumbSchema({
    siteUrl: SITE_URL,
    slug: article.slug,
    name: article.title,
  });

  return (
    <>
      <script
        id="usecase-breadcrumb-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <UseCaseDetailShell
        badge={article.badge}
        title={article.title}
        description={article.description}
      >
        <article className="space-y-0 text-left">
          {article.sections.map((section, index) => (
            <section
              key={section.title}
              className={index === 0 ? "space-y-3" : "mt-10 space-y-4"}
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-accent">
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="text-accent ml-5 list-disc space-y-1">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.links ? (
                <div className="mt-4 flex flex-wrap gap-4">
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`${linkIndex === 0 ? "text-primary" : "text-accent"} underline-offset-4 hover:underline`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </article>
      </UseCaseDetailShell>
    </>
  )
}
