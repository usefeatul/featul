"use client";

import { ShortcutKey } from "./keys";

import React from "react";
import {
  ArrowBigUp,
  SearchIcon,
  CommentsIcon,
} from "@/components/global/icons";

import { LoaderIcon } from "@featul/ui/icons/loader";

import { Button } from "@featul/ui/components/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@featul/ui/components/command";
import { useQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@featul/ui/lib/utils";
import { filterToolbarButtonClass } from "@/utils/filter/toolbar";
import StatusIcon from "@/components/requests/StatusIcon";
import { requestBadgeClass } from "@/components/requests/styles";

export type WorkspaceSearchResult = {
  id: string;
  title: string;
  slug: string;
  upvotes?: number;
  commentCount?: number;
  roadmapStatus?: string | null;
  boardName?: string | null;
  boardSlug?: string;
};

type WorkspaceSearchActionProps = {
  workspaceSlug: string;
  currentSearch: string;
  className?: string;
  buttonVariant: "card" | "nav";
  placeholder?: string;
  showLabel?: boolean;
  showShortcut?: boolean;
  showNoResults?: boolean;
  compact?: boolean;
  publicOnly?: boolean;
  onSearchSubmit: (value: string) => void;
  onResultSelect: (result: WorkspaceSearchResult) => void;
  onClearSearch?: () => void;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 150;

function SearchResultItem({
  result,
  query,
}: {
  result: WorkspaceSearchResult;
  query: string;
}) {
  const status = result.roadmapStatus || "pending";

  return (
    <>
      <StatusIcon
        status={status}
        className="size-4 shrink-0 text-foreground/80"
      />
      <p className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground" title={result.title}>
        <HighlightMatch text={result.title} query={query} />
      </p>
      <div className="flex shrink-0 items-center gap-1.5 tabular-nums">
        <span className={cn(requestBadgeClass, "gap-1 text-muted-foreground/70")} title={`${result.upvotes ?? 0} upvotes`}>
          <ArrowBigUp className="size-3" aria-hidden />
          <span>{result.upvotes ?? 0}</span>
        </span>
        <span className={cn(requestBadgeClass, "gap-1 text-muted-foreground/70")} title={`${result.commentCount ?? 0} comments`}>
          <CommentsIcon className="size-3" aria-hidden />
          <span>{result.commentCount ?? 0}</span>
        </span>
        {result.boardName ? (
          <span className={cn(requestBadgeClass, "hidden max-w-20 sm:inline-flex")} title={result.boardName}>
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="truncate uppercase tracking-wide">{result.boardName}</span>
          </span>
        ) : null}
      </div>
    </>
  );
}

function useIsMac() {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return isMac;
}

function KeyboardHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-muted px-2 py-1 font-heading text-[11px] leading-none text-foreground">
        {keys}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-primary/15 px-0.5 text-inherit">
        {text.slice(index, index + trimmed.length)}
      </mark>
      {text.slice(index + trimmed.length)}
    </>
  );
}

function SearchStatusMessage({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "placeholder";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-8 text-sm",
        variant === "placeholder" ? "text-accent" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WorkspaceSearchAction({
  workspaceSlug,
  currentSearch,
  className = "",
  buttonVariant,
  placeholder = "Search requests…",
  showLabel = false,
  showShortcut = false,
  showNoResults = false,
  compact = false,
  publicOnly = false,
  onSearchSubmit,
  onResultSelect,
  onClearSearch,
}: WorkspaceSearchActionProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(currentSearch);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const debouncedQuery = useDebounce(value.trim(), DEBOUNCE_MS);

  React.useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  React.useEffect(() => {
    const isEditableElement = (element: HTMLElement | null) => {
      if (!element) return false;
      const role = element.getAttribute("role") || "";
      const tag = element.tagName;
      return (
        role === "textbox" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        element.isContentEditable
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey) return;

      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (key !== "k") return;

      const usesPlatformModifier =
        (event.metaKey && !event.ctrlKey) || (event.ctrlKey && !event.metaKey);
      if (!usesPlatformModifier) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (isEditableElement(target) || isEditableElement(activeElement)) return;

      if (!buttonRef.current?.getClientRects().length) return;

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const input = document.querySelector(
        '[data-slot="command-input"]',
      ) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  }, [open]);

  const hasQuery = value.trim().length >= MIN_QUERY_LENGTH && debouncedQuery.length >= MIN_QUERY_LENGTH;
  const isDebouncing = value.trim() !== debouncedQuery;

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", workspaceSlug, debouncedQuery, publicOnly],
    enabled: open && hasQuery,
    queryFn: async () => {
      const res = await client.board.searchPostsByWorkspaceSlug.$get({
        slug: workspaceSlug,
        q: debouncedQuery,
        publicOnly,
      });
      const data = await res.json();
      return (data?.posts || []) as WorkspaceSearchResult[];
    },
    staleTime: 10_000,
  });

  const isSearching = value.trim().length >= MIN_QUERY_LENGTH && (isDebouncing || isFetching);
  const trimmedValue = value.trim();
  const canSubmit = trimmedValue.length >= MIN_QUERY_LENGTH;
  const canClear = trimmedValue.length > 0 || currentSearch.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setOpen(false);
    onSearchSubmit(trimmedValue);
  };

  const handleClear = () => {
    setValue("");
    setOpen(false);
    if (currentSearch) {
      onClearSearch?.();
    } else if (onClearSearch) {
      onClearSearch();
    } else {
      onSearchSubmit("");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setValue(currentSearch);
    }
  };

  const isMac = useIsMac();
  const platformKey = isMac ? "⌘" : "Ctrl";
  const enterKey = isMac ? "Return" : "Enter";
  const escKey = "Esc";
  const isSearchActive = Boolean(currentSearch.trim());

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label={`Search (${platformKey}K)`}
        title={`Search (${platformKey}K)`}
        aria-pressed={isSearchActive}
        className={cn(
          filterToolbarButtonClass(isSearchActive && !compact, className),
          compact &&
            "group border-0 bg-transparent text-neutral-400 shadow-none ring-0 before:hidden hover:bg-muted/60 hover:text-primary dark:bg-transparent dark:text-neutral-300 dark:hover:bg-white/[0.05] dark:hover:text-primary",
        )}
        onClick={() => setOpen(true)}
      >
        <SearchIcon
          className={cn(
            "size-4",
            compact && "size-5 transition-colors duration-200",
          )}
          size={compact ? 20 : 16}
        />
        {showLabel ? (
          <span
            className={cn(
              "min-w-0 truncate text-left font-normal",
              currentSearch ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {currentSearch || placeholder}
          </span>
        ) : null}
        {showShortcut ? (
          <span aria-hidden="true" className="ml-auto inline-flex shrink-0 items-center gap-1">
            {[platformKey, "K"].map((key) => (
              <ShortcutKey key={key} className="bg-muted text-muted-foreground dark:bg-black/30 dark:text-muted-foreground">{key}</ShortcutKey>
            ))}
          </span>
        ) : null}
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search"
        shouldFilter={false}
        contentClassName="px-0"
        width="search"
        icon={<SearchIcon className="size-3.5 opacity-80" />}
        footer={
          <div className="flex items-center justify-between border-t border-foreground/10 bg-sidebar px-4 py-2.5 text-sm text-muted-foreground">
            <span>
              {currentSearch ? (
                <>
                  Filtering by &ldquo;
                  <span className="font-heading">{currentSearch}</span>
                  &rdquo;
                </>
              ) : (
                "Search by title or content"
              )}
            </span>
            <div className="flex items-center gap-3">
              <KeyboardHint keys={enterKey} label="Filter" />
              {canClear ? <KeyboardHint keys={escKey} label="Clear" /> : null}
            </div>
          </div>
        }
      >
        <CommandInput
          value={value}
          onValueChange={setValue}
          placeholder={placeholder}
          aria-label={placeholder}
          wrapperClassName="px-6 [&>svg]:size-4"
          className="px-0 text-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
            if (event.key === "Escape" && canClear) {
              event.preventDefault();
              handleClear();
            }
          }}
        />
        <CommandList className="scrollbar-hide max-h-[min(55vh,400px)]">
          <CommandEmpty />
          {!hasQuery && !isSearching ? (
            <SearchStatusMessage variant="placeholder">
              Type at least {MIN_QUERY_LENGTH} characters to search posts
            </SearchStatusMessage>
          ) : null}
          {isSearching ? (
            <SearchStatusMessage>
              <LoaderIcon
                className="size-4 opacity-70"
                size={16}
              />
              Searching…
            </SearchStatusMessage>
          ) : null}
          {!isSearching && hasQuery && results.length > 0 ? (
            <CommandGroup className="py-1">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.title} ${result.boardName || ""}`}
                  onSelect={() => {
                    setOpen(false);
                    onResultSelect(result);
                  }}
                  className="my-0 min-h-10 items-center gap-3 rounded-none border-t border-border/40 first:border-t-0 dark:border-white/6 px-6 py-2 hover:bg-muted/50 hover:text-foreground aria-selected:bg-muted/50 aria-selected:text-foreground dark:hover:bg-white/[0.04] dark:aria-selected:bg-white/[0.04]"
                >
                  <SearchResultItem result={result} query={debouncedQuery} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {!isSearching && hasQuery && results.length === 0 && showNoResults ? (
            <SearchStatusMessage className="py-6">
              No posts found for &ldquo;{debouncedQuery}&rdquo;
            </SearchStatusMessage>
          ) : null}
          {canSubmit && !isSearching ? (
            <>
              {hasQuery && results.length > 0 ? <CommandSeparator className="mx-0 bg-foreground/10" /> : null}
              <CommandGroup className="px-2">
                <CommandItem onSelect={handleSubmit} className="text-primary">
                  <SearchIcon className="size-3.5 opacity-70" size={14} />
                  <span>View all results for &ldquo;{trimmedValue}&rdquo;</span>
                  <CommandShortcut>{enterKey}</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
