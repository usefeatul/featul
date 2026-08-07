"use client";

import { XMarkIcon } from "@featul/ui/icons/xmark";
import { Button } from "@featul/ui/components/button";

type SubdomainSearchResultsHeaderProps = {
  query: string;
  totalCount: number;
  onClear: () => void;
};

export function SubdomainSearchResultsHeader({
  query,
  totalCount,
  onClear,
}: SubdomainSearchResultsHeaderProps) {
  if (!query) return null;

  const countLabel = totalCount === 1 ? "1 result" : `${totalCount} results`;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 px-4 py-3.5 md:px-5">
      <p className="min-w-0 truncate text-sm text-muted-foreground">
        {countLabel} for{" "}
        <span className="font-heading text-foreground">&ldquo;{query}&rdquo;</span>
      </p>
      <Button
        type="button"
        variant="card"
        size="xs"
        onClick={onClear}
        aria-label={`Clear search ${query}`}
        className="size-7 shrink-0 px-0"
      >
        <XMarkIcon className="size-3" />
      </Button>
    </div>
  );
}
