"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { client } from "@featul/api/client";
import { modalCardInnerClass, modalCardShellClass } from "@featul/ui/lib/overlay";
import {
  settingsSectionClass,
  settingsSurfaceHeaderClass,
} from "@/components/settings/global/SectionCard";
import { cn } from "@featul/ui/lib/utils";
import { ArticleIcon, LoaderIcon, SearchIcon, SparklesIcon } from "@/components/global/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { HelpAskDialog } from "./HelpAskDialog";
import { helpArticleHref } from "./content";

type Result = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  collectionName: string | null;
};

type Option = { kind: "article"; result: Result } | { kind: "ask" };

/** A search counts for analytics once the visitor stops typing for this long. */
const SETTLE_MS = 1500;

/**
 * Help article search: debounced as you type, arrow keys to move, Enter to open.
 * With `askAi`, the last option hands the query to Ask AI.
 */
export function HelpSearch({
  slug,
  size = "lg",
  className,
  askAi = false,
}: {
  slug: string;
  size?: "lg" | "sm";
  className?: string;
  askAi?: boolean;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [asking, setAsking] = React.useState("");
  const debounced = useDebounce(query.trim(), 200);
  const settled = useDebounce(query.trim(), SETTLE_MS);
  const tracked = React.useRef("");

  const track = React.useCallback(
    (q: string) => {
      if (q.length < 2 || q.toLowerCase() === tracked.current) return;
      tracked.current = q.toLowerCase();
      void client.help.trackSearch.$post({ slug, q: q.slice(0, 120) }).catch(() => {});
    },
    [slug],
  );

  React.useEffect(() => {
    track(settled);
  }, [settled, track]);

  React.useEffect(() => {
    if (!debounced) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    client.help.search
      .$get({ slug, q: debounced })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const articles = ((data as { articles?: Result[] })?.articles ?? []) as Result[];
        setResults(articles);
        // Ask AI sits on top, but Enter still opens the best article when there is one.
        setActive(askAi && debounced.length >= 3 && articles.length > 0 ? 1 : 0);
      })
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [askAi, debounced, slug]);

  const trimmed = query.trim();
  const canAsk = askAi && trimmed.length >= 3;
  const offset = canAsk ? 1 : 0;
  const options: Option[] = [
    ...(canAsk ? [{ kind: "ask" as const }] : []),
    ...results.map((result) => ({ kind: "article" as const, result })),
  ];

  const choose = (option: Option | undefined) => {
    if (!option) return;
    track(trimmed);
    setOpen(false);
    if (option.kind === "ask") setAsking(trimmed);
    else router.push(helpArticleHref(option.result.slug));
  };

  const showPanel = open && trimmed.length > 0;
  const large = size === "lg";

  return (
    <div className={cn("relative w-full", className)}>
      {/* Settings-card frame: title row in the shell (hero size), the field is the inner surface. */}
      <div
        className={cn(
          large ? settingsSectionClass : modalCardShellClass,
          "text-left transition-[border-color] focus-within:border-primary/25 dark:focus-within:border-primary/25",
        )}
      >
        {large ? (
          <header className={settingsSurfaceHeaderClass}>
            <div className="flex min-w-0 items-center gap-2.5">
              <SearchIcon className="size-4 shrink-0 text-primary" />
              <h2 className="text-sm font-medium leading-6 text-foreground">Search articles</h2>
            </div>
            {askAi ? (
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <SparklesIcon className="size-3.5 text-primary" />
                Ask AI
              </span>
            ) : null}
          </header>
        ) : null}
        <div
          className={cn(
            modalCardInnerClass,
            "flex items-center gap-2.5 transition-[box-shadow] focus-within:ring-primary/20 dark:focus-within:ring-primary/25",
            large ? "h-12 px-4" : "h-10 px-3.5",
          )}
        >
          {large ? null : loading ? (
            <LoaderIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Search articles"
            value={query}
            placeholder={
              large
                ? askAi
                  ? "Type a keyword or ask a question"
                  : "Type a keyword"
                : askAi
                  ? "Search articles or ask a question"
                  : "Search articles"
            }
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, options.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                choose(options[active]);
              } else if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
              // 16px on phones so iOS Safari doesn't zoom the page when the field is focused.
              large ? "text-base sm:text-[15px]" : "text-base sm:text-sm",
            )}
          />
          {large && loading ? (
            <LoaderIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : null}
        </div>
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border/80 bg-popover p-1 shadow-lg dark:border-white/10"
        >
          {canAsk ? (
            <button
              type="button"
              role="option"
              aria-selected={active === 0}
              onMouseEnter={() => setActive(0)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose({ kind: "ask" })}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                active === 0 && "bg-muted dark:bg-white/[0.06]",
              )}
            >
              <SparklesIcon className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                Ask AI: <span className="font-medium">{trimmed}</span>
              </span>
              <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">Answer from articles</span>
            </button>
          ) : null}
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {loading || debounced !== trimmed ? "Searching…" : `No articles match "${trimmed}"`}
            </p>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                role="option"
                aria-selected={index + offset === active}
                onMouseEnter={() => setActive(index + offset)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose({ kind: "article", result })}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left",
                  index + offset === active && "bg-muted dark:bg-white/[0.06]",
                )}
              >
                <ArticleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{result.title}</span>
                  {result.summary ? (
                    <span className="block truncate text-xs text-muted-foreground">{result.summary}</span>
                  ) : null}
                </span>
                {result.collectionName ? (
                  <span className="hidden shrink-0 pt-0.5 text-[11px] text-muted-foreground sm:inline">{result.collectionName}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}

      {askAi ? (
        <HelpAskDialog
          slug={slug}
          open={Boolean(asking)}
          onOpenChange={(next) => !next && setAsking("")}
          initialQuestion={asking}
        />
      ) : null}
    </div>
  );
}
