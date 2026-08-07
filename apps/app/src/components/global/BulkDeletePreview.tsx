"use client";

type BulkDeletePreviewProps = {
  titles: string[];
  itemLabel: string;
};

const PREVIEW_LIMIT = 5;

export function BulkDeletePreview({ titles, itemLabel }: BulkDeletePreviewProps) {
  if (titles.length === 0) return null;

  const visibleTitles = titles.slice(0, PREVIEW_LIMIT);
  const remainingCount = titles.length - visibleTitles.length;
  const pluralLabel = remainingCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2">
      <ul className="space-y-1 text-sm text-foreground">
        {visibleTitles.map((title, index) => (
          <li key={`${title}-${index}`} className="truncate">
            {title}
          </li>
        ))}
      </ul>
      {remainingCount > 0 ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          and {remainingCount} more {pluralLabel}
        </p>
      ) : null}
    </div>
  );
}
