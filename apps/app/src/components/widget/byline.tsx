import { WidgetAuthorAvatar } from "./avatar";
import type { WidgetChangelogEntry } from "./updates";

export function UpdateByline({
  entry,
  accent,
  fallbackBadge = "Just shipped",
}: {
  entry: WidgetChangelogEntry;
  accent: string;
  fallbackBadge?: string | null;
}) {
  const date = entry.publishedAt ? new Date(entry.publishedAt) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "";
  const releaseTag = entry.tags?.find((tag) => tag.name?.trim());
  const badgeLabel = releaseTag?.name.trim() || fallbackBadge;
  if (!entry.authorName && !dateLabel && !badgeLabel) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs leading-5 text-[rgb(var(--widget-fg)/0.5)]">
      {entry.authorName ? (
        <span
          className="inline-flex min-w-0 max-w-full items-center gap-1.5"
          title={[entry.authorName, entry.authorRoleLabel]
            .filter(Boolean)
            .join(" · ")}
        >
          <WidgetAuthorAvatar
            name={entry.authorName}
            image={entry.authorImage}
            className="size-5"
          />
          <span className="max-w-[12rem] truncate font-medium text-[rgb(var(--widget-fg)/0.75)]">
            {entry.authorName}
          </span>
        </span>
      ) : null}
      {dateLabel && date ? (
        <span className="inline-flex items-center gap-2">
          {entry.authorName ? (
            <span
              aria-hidden="true"
              className="text-[rgb(var(--widget-fg)/0.25)]"
            >
              ·
            </span>
          ) : null}
          <time
            dateTime={date.toISOString()}
            title={date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          >
            {dateLabel}
          </time>
        </span>
      ) : null}
      {badgeLabel ? (
        <span className="inline-flex min-w-0 max-w-full items-center gap-2">
          {entry.authorName || dateLabel ? (
            <span
              aria-hidden="true"
              className="text-[rgb(var(--widget-fg)/0.25)]"
            >
              ·
            </span>
          ) : null}
          <span
            className="truncate"
            title={badgeLabel}
            style={{ color: releaseTag?.color || accent }}
          >
            {badgeLabel}
          </span>
        </span>
      ) : null}
    </div>
  );
}
