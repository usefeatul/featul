"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from "framer-motion";
import type { HelpArticleLink, HelpTree } from "@featul/api/help/queries";
import { cn } from "@featul/ui/lib/utils";
import { ArticleIcon, ChevronRight } from "@/components/global/icons";
import { HelpCollectionIcon } from "@/components/help/icons";
import { helpArticleHref, helpCollectionHref } from "./content";

const UNCATEGORIZED = "__more__";

// Short and soft: the tree should feel responsive, never bouncy.
const glide: Transition = { type: "spring", stiffness: 520, damping: 42, mass: 0.6 };
const reveal: Transition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] };
const instant: Transition = { duration: 0 };

type Motion = { glide: Transition; reveal: Transition };

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
  const reduceMotion = useReducedMotion();
  const motionConfig: Motion = reduceMotion
    ? { glide: instant, reveal: instant }
    : { glide, reveal };
  const currentKey =
    currentCollectionId === undefined ? undefined : (currentCollectionId ?? UNCATEGORIZED);
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(currentKey ? [currentKey] : []),
  );
  // Moves the marker on click, before the next page arrives, so the slide is visible.
  const [selectedId, setSelectedId] = React.useState(activeArticleId);
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);

  React.useEffect(() => setSelectedId(activeArticleId), [activeArticleId]);

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
      href: helpCollectionHref(c.slug) as string | null,
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
      <LayoutGroup id="help-nav">
        <ul className="space-y-0.5" onMouseLeave={() => setHoveredRow(null)}>
          {groups.map((g) => {
            const isOpen = expanded.has(g.key);
            const isCurrent = g.key === currentKey;
            const listId = `help-nav-${g.key}`;
            const rowKey = `collection:${g.key}`;
            const label = (
              <>
                {g.icon}
                <span className="min-w-0 flex-1 truncate">{g.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">{g.articles.length}</span>
              </>
            );
            const labelClass = cn(
              "relative flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 text-left",
              isCurrent && "font-medium",
            );
            return (
              <li key={g.key}>
                <motion.div
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  className={cn(
                    "relative flex items-center rounded-lg transition-colors duration-150",
                    isCurrent || hoveredRow === rowKey ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {hoveredRow === rowKey ? (
                    <motion.span
                      layoutId="help-nav-hover-collection"
                      transition={motionConfig.glide}
                      aria-hidden
                      className="absolute inset-0 rounded-lg bg-muted/70 dark:bg-white/[0.05]"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggle(g.key)}
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${g.name}`}
                    className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    <motion.span
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={motionConfig.reveal}
                      className="flex"
                    >
                      <ChevronRight className="size-3.5" />
                    </motion.span>
                  </button>
                  {g.href ? (
                    <Link href={g.href} onClick={() => !isOpen && toggle(g.key)} className={labelClass}>
                      {label}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => toggle(g.key)} className={cn(labelClass, "cursor-pointer")}>
                      {label}
                    </button>
                  )}
                </motion.div>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="branch"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={motionConfig.reveal}
                      className="overflow-hidden"
                    >
                      <ArticleBranch
                        id={listId}
                        branchKey={g.key}
                        articles={g.articles}
                        selectedId={selectedId}
                        hoveredRow={hoveredRow}
                        onHover={setHoveredRow}
                        onSelect={setSelectedId}
                        motionConfig={motionConfig}
                        pressable={!reduceMotion}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}

function ArticleBranch({
  id,
  branchKey,
  articles,
  selectedId,
  hoveredRow,
  onHover,
  onSelect,
  motionConfig,
  pressable,
}: {
  id: string;
  branchKey: string;
  articles: HelpArticleLink[];
  selectedId?: string;
  hoveredRow: string | null;
  onHover: (row: string) => void;
  onSelect: (articleId: string) => void;
  motionConfig: Motion;
  pressable: boolean;
}) {
  return (
    <ul id={id} className="mb-2 ml-[0.875rem] mt-0.5 border-l border-border/70 dark:border-white/[0.08]">
      {articles.map((a) => {
        const active = a.id === selectedId;
        const rowKey = `article:${a.id}`;
        const hovered = hoveredRow === rowKey;
        return (
          <li key={a.id} className="relative" onMouseEnter={() => onHover(rowKey)}>
            {active ? (
              // One marker for the whole tree: it slides along the branch line to the new article.
              <motion.span
                layoutId="help-nav-active"
                transition={motionConfig.glide}
                aria-hidden
                className="absolute -left-px inset-y-1 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            {hovered ? (
              <motion.span
                layoutId={`help-nav-hover-${branchKey}`}
                transition={motionConfig.glide}
                aria-hidden
                className="absolute inset-y-0 left-2 right-0 rounded-md bg-muted/60 dark:bg-white/[0.04]"
              />
            ) : null}
            <motion.div whileTap={pressable ? { scale: 0.985 } : undefined} className="relative origin-left">
              <Link
                href={helpArticleHref(a.slug)}
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(a.id)}
                className={cn(
                  "block py-1.5 pl-4 pr-2 text-[13px] leading-5 transition-colors duration-150",
                  active ? "font-medium text-foreground" : hovered ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {a.title}
              </Link>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
