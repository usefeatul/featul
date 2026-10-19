"use client";

import React from "react";
import Link from "next/link";
import type { HelpArticleLink, HelpTree } from "@featul/api/help/queries";
import { cn } from "@featul/ui/lib/utils";
import { ArticleIcon, ChevronRight } from "@/components/global/icons";
import { HelpCollectionIcon } from "@/components/help/icons";
import { helpArticleHref, helpCollectionHref } from "./content";

const UNCATEGORIZED = "__more__";

/**
 * Desktop help navigation: one tree in a fixed order on every page. The current collection
 * opens in place to show its articles; the chevron peeks into any other without navigating.
 */
export function HelpNavTree({
  tree,
  currentCollectionId,
  activeArticleId,
}: {
  tree: HelpTree;
  /** Collection being read; `null` means an uncategorized article. */
  currentCollectionId?: string | null;
  activeArticleId?: string;
}) {
  const currentKey =
    currentCollectionId === undefined ? undefined : (currentCollectionId ?? UNCATEGORIZED);
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(currentKey ? [currentKey] : []),
  );

  // Moving to another collection opens it too; whatever the reader opened stays open.
  React.useEffect(() => {
    if (!currentKey) return;
    setExpanded((prev) => (prev.has(currentKey) ? prev : new Set(prev).add(currentKey)));
  }, [currentKey]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const groups = [
    ...tree.collections.map((c) => ({
      key: c.id,
      name: c.name,
      href: helpCollectionHref(c.slug),
      icon: <HelpCollectionIcon icon={c.icon} className="size-4 shrink-0" />,
      articles: c.articles,
    })),
    ...(tree.uncategorized.length > 0
      ? [
          {
            key: UNCATEGORIZED,
            name: "More articles",
            href: null,
            icon: <ArticleIcon className="size-4 shrink-0" />,
            articles: tree.uncategorized,
          },
        ]
      : []),
  ];

  return (
    <nav aria-label="Help center" className="text-sm">
      <Link
        href="/help"
        className="mb-3 flex items-center px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        All collections
      </Link>
      <ul className="space-y-0.5">
        {groups.map((g) => {
          const isOpen = expanded.has(g.key);
          const isCurrent = g.key === currentKey;
          const listId = `help-nav-${g.key}`;
          return (
            <li key={g.key}>
              <div
                className={cn(
                  "group flex items-center rounded-lg transition-colors",
                  isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/[0.04]",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(g.key)}
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${g.name}`}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  <ChevronRight className={cn("size-3.5 transition-transform duration-150", isOpen && "rotate-90")} />
                </button>
                {g.href ? (
                  <Link
                    href={g.href}
                    onClick={() => !isOpen && toggle(g.key)}
                    className={cn("flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2", isCurrent && "font-medium")}
                  >
                    {g.icon}
                    <span className="min-w-0 flex-1 truncate">{g.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">{g.articles.length}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(g.key)}
                    className={cn("flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 pr-2 text-left", isCurrent && "font-medium")}
                  >
                    {g.icon}
                    <span className="min-w-0 flex-1 truncate">{g.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">{g.articles.length}</span>
                  </button>
                )}
              </div>
              {isOpen ? (
                <ArticleBranch id={listId} articles={g.articles} activeArticleId={activeArticleId} />
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ArticleBranch({
  id,
  articles,
  activeArticleId,
}: {
  id: string;
  articles: HelpArticleLink[];
  activeArticleId?: string;
}) {
  return (
    <ul id={id} className="mb-2 ml-[0.875rem] mt-0.5 border-l border-border/70 dark:border-white/[0.08]">
      {articles.map((a) => {
        const active = a.id === activeArticleId;
        return (
          <li key={a.id}>
            <Link
              href={helpArticleHref(a.slug)}
              aria-current={active ? "page" : undefined}
              className={cn(
                // The active row's 2px marker sits on top of the branch line.
                "-ml-px block border-l-2 py-1.5 pl-4 pr-2 text-[13px] leading-5 transition-colors",
                active
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground dark:hover:border-white/20",
              )}
            >
              {a.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
