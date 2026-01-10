"use client"

import React from "react"
import { format } from "date-fns"
import StatusIcon from "@/components/requests/StatusIcon"
import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"

interface MemberActivityProps {
  items: any[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

function renderActivityDescription(it: any) {
  const status = it.status || it.metadata?.status || it.metadata?.roadmapStatus || it.metadata?.toStatus
  const tags =
    (Array.isArray(it.metadata?.tags) && it.metadata?.tags) ||
    (Array.isArray((it.metadata as any)?.tagSummaries) && (it.metadata as any).tagSummaries) ||
    []

  if (it.entity === "post") {
    if (it.type === "post_meta_updated") {
      const fromStatus = it.metadata?.fromStatus
      const toStatus = it.metadata?.toStatus || status
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>changed status</span>
          {fromStatus && (
            <>
              <span>from</span>
              <StatusIcon status={String(fromStatus)} className="size-3.5 shrink-0" />
            </>
          )}
          {toStatus && (
            <>
              <span>to</span>
              <StatusIcon status={String(toStatus)} className="size-3.5 shrink-0" />
            </>
          )}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_updated") {
      const hasTagsChange = Boolean(it.metadata?.hasTagsChange)
      const hasTagsAdded = Boolean(it.metadata?.hasTagsAdded)
      const hasTagsRemoved = Boolean(it.metadata?.hasTagsRemoved)

      let label = "updated post"
      if (hasTagsChange) {
        if (hasTagsAdded && !hasTagsRemoved) {
          label = "added tags to"
        } else if (hasTagsRemoved && !hasTagsAdded) {
          label = "removed tags from"
        } else {
          label = "updated tags on"
        }
      }

      return (
        <span className="flex flex-col gap-2 min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <span>{label}</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
          {Array.isArray(tags) && tags.length > 0 ? (
            <span className="mt-0.5 flex flex-wrap gap-2 text-sm text-accent">
              {tags.map((t: any) => (
                <span
                  key={String(t.id || t.slug || t.name)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70  ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-muted/80 px-2 py-0.5"
                >
                  {t.color ? (
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                  ) : null}
                  <span className="truncate max-w-[160px]">
                    {t.name || t.slug || "tag"}
                  </span>
                </span>
              ))}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_created") {
      return (
        <span className="flex flex-col gap-2 min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <span>created post</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
          {Array.isArray(tags) && tags.length > 0 ? (
            <span className="mt-0.5 flex flex-wrap gap-2 text-sm text-accent">
              {tags.map((t: any) => (
                <span
                  key={String(t.id || t.slug || t.name)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70  ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-muted/80 px-2 py-0.5"
                >
                  {t.color ? (
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                  ) : null}
                  <span className="truncate max-w-[160px]">
                    {t.name || t.slug || "tag"}
                  </span>
                </span>
              ))}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_deleted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted post</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_voted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>voted for</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_vote_removed") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>removed vote from</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_board_updated") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>moved post</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_merged") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>merged post into</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }

    if (it.type === "post_reported") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>reported post</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
  }

  if (it.entity === "comment") {
    if (it.type === "comment_created") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>added a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_updated") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>updated a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_deleted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_voted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>voted on a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_vote_removed") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>removed vote from a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_reported") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>reported a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_pinned") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>pinned a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "comment_unpinned") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>unpinned a comment on</span>
          {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
  }

  if (it.entity === "changelog_entry") {
    if (it.type === "changelog_entry_created") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>created changelog entry</span>
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "changelog_entry_updated") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>updated changelog entry</span>
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "changelog_entry_deleted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted changelog entry</span>
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
    if (it.type === "changelog_entry_published") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>published changelog entry</span>
          {it.title ? (
            <span className="text-foreground font-medium truncate">
              {it.title}
            </span>
          ) : null}
        </span>
      )
    }
  }

  if (it.entity === "tag") {
    const label = it.title || it.metadata?.slug || "tag"
    const color = it.metadata?.color || null

    if (it.type === "tag_created") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>created tag</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/80 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black px-2 py-0.5 text-sm">
            {color ? (
              
              
              <span
                className="inline-block size-2 rounded-full "
                style={{ backgroundColor: color }}
              />
            ) : null}
            <span className="truncate max-w-[160px]">
              {label}
            </span>
          </span>
        </span>
      )
    }

    if (it.type === "tag_deleted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted tag</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black px-2 py-0.5 text-sm">
            <span className="truncate max-w-[160px]">
              {label}
            </span>
          </span>
        </span>
      )
    }
  }

  if (it.entity === "changelog_tag") {
    const label = it.title || it.metadata?.slug || "tag"
    const color = it.metadata?.color || null

    if (it.type === "changelog_tag_created") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>created changelog tag</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-muted/80 px-2 py-0.5 text-sm">
            {color ? (
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            ) : null}
            <span className="truncate max-w-[160px]">
              {label}
            </span>
          </span>
        </span>
      )
    }

    if (it.type === "changelog_tag_deleted") {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted changelog tag</span>
          {label ? (
            <span className="inline-flex items-center 2 rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-sm">
              <span className="truncate max-w-[160px]">
                {label}
              </span>
            </span>
          ) : null}
        </span>
      )
    }
  }

  return <span>{it.type.replace("_", " ")}</span>
}

export function MemberActivity({ items, hasNextPage, isFetchingNextPage, onLoadMore, isLoading }: MemberActivityProps) {
  return (
    <div className="lg:col-span-2 lg:pr-4 lg:border-r lg:border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Activity</div>
      </div>
      <ul className="divide-y divide-border">
        {isLoading && items.length === 0 ? (
          <li className="py-6">
            <LoadingSpinner label="Loading activity..." />
          </li>
        ) : items.length === 0 ? (
          <li className="py-6 text-accent text-sm text-center">No activity yet</li>
        ) : (
          items.map((it: any) => (
            <li key={`${it.type}-${it.id}-${String(it.createdAt)}`} className="py-3">
              <div className="text-xs text-accent flex items-start gap-2 min-w-0">
                <span className="font-medium">
                  {format(new Date(it.createdAt), "LLL d")}
                </span>
                {renderActivityDescription(it)}
              </div>
            </li>
          ))
        )}
      </ul>
      {hasNextPage ? (
        <div className="pt-3 mt-1 border-t flex justify-center">
          <Button
          variant="nav"


            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
