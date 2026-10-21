import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@featul/ui/lib/utils"
import type { DocsNavItem } from "@/config/docsNav"
import type { TocItem } from "@/lib/toc"

export function DocsBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
            {i > 0 ? <span aria-hidden className="text-muted-foreground/50">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="truncate transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

const disclosureClass =
  "group rounded-xl border border-border/70 dark:border-white/[0.08] [&[open]>summary_svg]:rotate-180"
const summaryClass =
  "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden"

/** Phones and tablets: the outline and section pages that the side rails show on desktop. */
export function DocsMobileArticleNav({
  headings,
  sectionLabel,
  siblings,
  activeHref,
}: {
  headings: TocItem[]
  sectionLabel: string
  siblings: DocsNavItem[]
  activeHref: string
}) {
  const top = headings.length ? Math.min(...headings.map((h) => h.level)) : 0
  const showSiblings = siblings.length > 1
  if (headings.length < 2 && !showSiblings) return null
  return (
    <div className="mt-6 space-y-2 lg:hidden">
      {headings.length >= 2 ? (
        <details className={disclosureClass}>
          <summary className={summaryClass}>
            On this page
            <ChevronDown aria-hidden className="size-4 text-muted-foreground transition-transform" strokeWidth={1.5} />
          </summary>
          <ul className="border-t border-border/70 px-2 py-2 dark:border-white/[0.08]">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  style={{ paddingLeft: `${0.5 + (h.level - top) * 0.75}rem` }}
                  className="flex min-h-10 items-center rounded-lg pr-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/[0.04]"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {showSiblings ? (
        <details className={cn(disclosureClass, "md:hidden")}>
          <summary className={summaryClass}>
            <span className="min-w-0 truncate">More in {sectionLabel}</span>
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform" strokeWidth={1.5} />
          </summary>
          <ul className="border-t border-border/70 px-2 py-2 dark:border-white/[0.08]">
            {siblings.map((item) => {
              const active = item.href === activeHref
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center rounded-lg px-2 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground dark:bg-white/[0.06]"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/[0.04]",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
