"use client";

import React from "react";
import { Heart } from "lucide-react";
import { SearchIcon } from "@featul/ui/icons/search";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { EnterKeyIcon } from "@featul/ui/icons/enter-key";
import { EscapeKeyIcon } from "@featul/ui/icons/escape-key";
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
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";

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
  showNoResults?: boolean;
  onSearchSubmit: (value: string) => void;
  onResultSelect: (result: WorkspaceSearchResult) => void;
  onClearSearch?: () => void;
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

function SearchResultItem({
  result,
  query,
}: {
  result: WorkspaceSearchResult;
  query: string;
}) {
  const status = result.roadmapStatus || "pending";

  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-accent">
        <StatusIcon status={status} className="size-3.5 shrink-0 opacity-90" />
        <span className="shrink-0 capitalize">{statusLabel(status)}</span>
        {result.boardName ? (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="truncate text-muted-foreground">{result.boardName}</span>
          </>
        ) : null}
      </div>
      <p className="mt-1 truncate text-sm font-medium text-foreground">
        <HighlightMatch text={result.title} query={query} />
      </p>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3.5 opacity-70" aria-hidden />
          <span className="tabular-nums">{result.upvotes ?? 0}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <CommentsIcon className="size-3.5 opacity-70" aria-hidden />
          <span className="tabular-nums">{result.commentCount ?? 0}</span>
        </span>
      </div>
    </div>
  );
}

function useIsMac() {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return isMac;
}

function KeyboardHint({
  icon,
  label,
  ariaKey,
}: {
  icon: React.ReactNode;
  label: string;
  ariaKey: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd
        aria-label={ariaKey}
        className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-muted px-2 py-1 text-foreground"
      >
        {icon}
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
  showNoResults = false,
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

  const hasQuery = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const isDebouncing = value.trim() !== debouncedQuery;

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", workspaceSlug, debouncedQuery],
    enabled: open && hasQuery,
    queryFn: async () => {
      const res = await client.board.searchPostsByWorkspaceSlug.$get({
        slug: workspaceSlug,
        q: debouncedQuery,
      });
      const data = await res.json();
      return (data?.posts || []) as WorkspaceSearchResult[];
    },
    staleTime: 10_000,
  });

  const isSearching = isDebouncing || isFetching;
  const trimmedValue = value.trim();
  const canSubmit = trimmedValue.length > 0;
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
  const enterKeyLabel = isMac ? "Return" : "Enter";
  const escKeyLabel = "Escape";

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label={`Search (${platformKey}K)`}
        title={`Search (${platformKey}K)`}
        className={className}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-4 h-4" size={16} />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search"
        width="wide"
        icon={<SearchIcon className="size-3.5 opacity-80" />}
        footer={
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              {currentSearch
                ? `Filtering by "${currentSearch}"`
                : "Search by title or content"}
            </span>
            <div className="flex items-center gap-3">
              <KeyboardHint
                icon={<EnterKeyIcon size={13} className="opacity-90" />}
                label="Filter"
                ariaKey={enterKeyLabel}
              />
              {canClear ? (
                <KeyboardHint
                  icon={<EscapeKeyIcon size={13} className="opacity-90" />}
                  label="Clear"
                  ariaKey={escKeyLabel}
                />
              ) : null}
            </div>
          </div>
        }
      >
        <CommandInput
          value={value}
          onValueChange={setValue}
          placeholder={placeholder}
          aria-label={placeholder}
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
        <CommandList className="max-h-[min(50vh,360px)]">
          <CommandEmpty />
          {!hasQuery && !isSearching ? (
            <SearchStatusMessage variant="placeholder">
              Type at least {MIN_QUERY_LENGTH} characters to search posts
            </SearchStatusMessage>
          ) : null}
          {isSearching ? (
            <SearchStatusMessage>
              <LoaderIcon className="size-4 animate-spin opacity-70" size={16} />
              Searching…
            </SearchStatusMessage>
          ) : null}
          {!isSearching && hasQuery && results.length > 0 ? (
            <CommandGroup>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.title} ${result.boardName || ""}`}
                    onSelect={() => {
                      setOpen(false);
                      onResultSelect(result);
                    }}
                    className="items-start gap-3 py-3"
                  >
                    <SearchResultItem result={result} query={debouncedQuery} />
                    <ChevronRightIcon
                      className="mt-1 size-3.5 shrink-0 opacity-40"
                      size={14}
                    />
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
              {hasQuery && results.length > 0 ? <CommandSeparator /> : null}
              <CommandGroup>
                <CommandItem onSelect={handleSubmit} className="text-primary">
                  <SearchIcon className="size-3.5 opacity-70" size={14} />
                  <span>
                    View all results for &ldquo;{trimmedValue}&rdquo;
                  </span>
                  <CommandShortcut>
                    <EnterKeyIcon size={12} className="opacity-70" />
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
