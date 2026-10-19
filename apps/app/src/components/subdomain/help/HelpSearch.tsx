"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { client } from "@featul/api/client";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ArticleIcon, LoaderIcon, SearchIcon } from "@/components/global/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { helpArticleHref } from "./content";

type Result = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  collectionName: string | null;
};

/** Help article search: debounced as you type, arrow keys to move, Enter to open. */
export function HelpSearch({
  slug,
  size = "lg",
  className,
}: {
  slug: string;
  size?: "lg" | "sm";
  className?: string;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const debounced = useDebounce(query.trim(), 200);

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
        setResults(((data as { articles?: Result[] })?.articles ?? []) as Result[]);
        setActive(0);
      })
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, slug]);

  const go = (result: Result | undefined) => {
    if (!result) return;
    setOpen(false);
    router.push(helpArticleHref(result.slug));
  };

  const showPanel = open && query.trim().length > 0;
  const large = size === "lg";

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          // Same raised surface and keycaps as the portal header's search field.
          raisedSurfaceClass,
          "flex items-center gap-2.5 rounded-lg transition-[filter,box-shadow] hover:brightness-[0.98] focus-within:ring-3 focus-within:ring-primary/15 dark:hover:brightness-125",
          large ? "h-12 px-4" : "h-10 px-3.5",
        )}
      >
        {loading ? (
          <LoaderIcon className={cn("shrink-0 text-muted-foreground", large ? "size-4.5" : "size-4")} />
        ) : (
          <SearchIcon className={cn("shrink-0 text-muted-foreground", large ? "size-4.5" : "size-4")} />
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
          placeholder="Search articles"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[active]);
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
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border/80 bg-popover p-1 shadow-lg dark:border-white/10"
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {loading || debounced !== query.trim() ? "Searching…" : `No articles match "${query.trim()}"`}
            </p>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(result)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left",
                  index === active && "bg-muted dark:bg-white/[0.06]",
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
    </div>
  );
}
