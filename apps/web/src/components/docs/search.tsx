"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { IconFileTextFilled } from "@tabler/icons-react"
import { Mascot } from "@featul/ui/components/mascot"
import { SearchIcon } from "@featul/ui/icons/search"
import { modalCardInnerClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import type { DocsArticleLink } from "@/lib/docs"
import { docsSectionClass, docsSurfaceHeaderClass } from "./surface"

const MAX_RESULTS = 8

/** Title hits first, then summary, then section, so the best page sits on top. */
function searchDocs(articles: DocsArticleLink[], query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []
  return articles
    .map((article) => {
      const title = article.title.toLowerCase()
      const summary = (article.summary ?? "").toLowerCase()
      const section = article.sectionLabel.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (title.includes(term)) score += title.startsWith(term) ? 4 : 3
        else if (summary.includes(term)) score += 2
        else if (section.includes(term)) score += 1
        else return null
      }
      return { article, score }
    })
    .filter((hit): hit is { article: DocsArticleLink; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((hit) => hit.article)
}

/** Docs search, the help center's: filters as you type, arrow keys to move, Enter to open, `/` to focus. */
export function DocsSearch({
  articles,
  size = "lg",
  className,
}: {
  articles: DocsArticleLink[]
  size?: "lg" | "sm"
  className?: string
}) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listId = React.useId()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)

  const trimmed = query.trim()
  const results = React.useMemo(() => searchDocs(articles, trimmed), [articles, trimmed])

  React.useEffect(() => setActive(0), [trimmed])

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (/^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable)) return
      // Only the field the reader can see answers the shortcut.
      if (!inputRef.current?.offsetParent) return
      event.preventDefault()
      inputRef.current.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const choose = (article: DocsArticleLink | undefined) => {
    if (!article) return
    setOpen(false)
    router.push(article.href)
  }

  const showPanel = open && trimmed.length > 0
  const large = size === "lg"

  return (
    <div className={cn("relative w-full", className)}>
      {/* Settings-card frame: title row in the shell, the field is the inner surface. */}
      <div
        className={cn(
          docsSectionClass,
          "text-left transition-[border-color] focus-within:border-primary/25 dark:focus-within:border-primary/25",
        )}
      >
        <header className={docsSurfaceHeaderClass}>
          <div className="flex min-w-0 items-center gap-2.5">
            <SearchIcon size={16} className="shrink-0 text-primary" />
            <h2 className="text-sm font-medium leading-6 text-foreground">Search docs</h2>
          </div>
        </header>
        <div
          className={cn(
            modalCardInnerClass,
            "flex items-center gap-2.5 transition-[box-shadow] focus-within:ring-primary/20 dark:focus-within:ring-primary/25",
            large ? "h-12 px-4" : "h-10 px-3.5",
          )}
        >
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Search docs"
            value={query}
            placeholder="Type a keyword"
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((i) => Math.min(i + 1, results.length - 1))
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (e.key === "Enter") {
                e.preventDefault()
                choose(results[active])
              } else if (e.key === "Escape") {
                setOpen(false)
                inputRef.current?.blur()
              }
            }}
            className={cn(
              "min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground focus:ring-0 [&::-webkit-search-cancel-button]:hidden",
              // 16px on phones so iOS Safari doesn't zoom the page when the field is focused.
              large ? "text-base sm:text-[15px]" : "text-base sm:text-sm",
            )}
          />
        </div>
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border/80 bg-popover p-1 shadow-lg dark:border-white/10"
        >
          {results.length === 0 ? (
            <div className="flex flex-col items-center px-3 py-6 text-center text-sm text-muted-foreground">
              <Mascot size={64} mood="search" className="mb-3" />
              {`No pages match "${trimmed}"`}
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(result)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left",
                  index === active && "bg-muted dark:bg-white/[0.06]",
                )}
              >
                <IconFileTextFilled aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{result.title}</span>
                  {result.summary ? (
                    <span className="block truncate text-xs text-muted-foreground">{result.summary}</span>
                  ) : null}
                </span>
                <span className="hidden shrink-0 pt-0.5 text-[11px] text-muted-foreground sm:inline">
                  {result.sectionLabel}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
