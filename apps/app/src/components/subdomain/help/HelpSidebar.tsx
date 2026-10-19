import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import { ChevronDown } from "@/components/global/icons";
import type { HelpArticleLink, HelpCollectionSummary } from "@featul/api/help/queries";
import { HelpCollectionIcon } from "@/components/help/icons";
import { helpArticleHref, helpCollectionHref } from "./content";

export function HelpBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
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
  );
}

export function HelpCollectionTile({ icon, className }: { icon?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15",
        className,
      )}
    >
      <HelpCollectionIcon icon={icon} className="size-4.5" />
    </span>
  );
}

/** Phones only: swipeable row of every collection, replacing the hidden left rail. */
export function HelpCollectionChips({
  collections,
  currentId,
  className,
}: {
  collections: HelpCollectionSummary[];
  currentId?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Collections" className={cn("md:hidden", className)}>
      <ul className="-mx-3 flex snap-x scroll-px-3 gap-2 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:scroll-px-4 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((c) => {
          const active = c.id === currentId;
          return (
            <li key={c.id} className="shrink-0 snap-start">
              <Link
                href={helpCollectionHref(c.slug)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/80 text-muted-foreground hover:text-foreground dark:border-white/10",
                )}
              >
                <HelpCollectionIcon icon={c.icon} className="size-4" />
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const disclosureClass =
  "group rounded-xl border border-border/70 dark:border-white/[0.08] [&[open]>summary_svg]:rotate-180";
const summaryClass =
  "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden";

/** Phones and tablets: the outline and collection list that the side rails show on desktop. */
export function HelpMobileArticleNav({
  headings,
  collection,
  siblings,
  activeArticleId,
}: {
  headings: Array<{ id: string; text: string; level: number }>;
  collection: HelpCollectionSummary | null;
  siblings: HelpArticleLink[];
  activeArticleId: string;
}) {
  const top = headings.length ? Math.min(...headings.map((h) => h.level)) : 0;
  const showSiblings = siblings.length > 1;
  if (headings.length < 2 && !showSiblings) return null;
  return (
    <div className="mt-6 space-y-2 lg:hidden">
      {headings.length >= 2 ? (
        <details className={disclosureClass}>
          <summary className={summaryClass}>
            On this page
            <ChevronDown className="size-4 text-muted-foreground transition-transform" />
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
            <span className="min-w-0 truncate">More in {collection?.name ?? "this help center"}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform" />
          </summary>
          <ul className="border-t border-border/70 px-2 py-2 dark:border-white/[0.08]">
            {siblings.map((a) => {
              const active = a.id === activeArticleId;
              return (
                <li key={a.id}>
                  <Link
                    href={helpArticleHref(a.slug)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center rounded-lg px-2 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground dark:bg-white/[0.06]"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/[0.04]",
                    )}
                  >
                    {a.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
