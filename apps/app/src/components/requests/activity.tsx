"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import RoleBadge from "@/components/global/RoleBadge";
import Changes, { ActivitySymbol } from "./changes";
import type { PostActivityItem } from "@featul/api/activity/post";
import { Button } from "@featul/ui/components/button";
import { relativeTime } from "@/lib/time";
import { getInitials } from "@/utils/user";

import type { usePostActivity } from "@/hooks/usePostActivity";

function summary(item: PostActivityItem) {
  if (!item.changes.length) return item.description;
  if (item.changes.length > 1) return "updated this post";
  if (item.kind === "status") return "changed status";
  if (item.kind === "board") return "moved";
  if (item.kind === "images") return "updated images";
  return item.description;
}

export default function Activity({
  activity,
}: {
  activity: ReturnType<typeof usePostActivity>;
}) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = activity;
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (isPending) return null;
  if (isError && !items.length)
    return (
      <div
        role="alert"
        className="space-y-2 py-8 text-center text-sm text-muted-foreground"
      >
        <p>Couldn’t load activity.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  if (!items.length)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity yet. Updates to this post will appear here.
      </p>
    );

  return (
    <div className="py-3">
      <ol aria-label="Post activity" className="space-y-5">
        {items.map((item) => {
          const inline =
            item.changes.length === 1 &&
            ["status", "tags", "board"].includes(item.kind);
          const showDetails =
            !["pinned", "locked", "featured"].includes(item.kind) ||
            item.changes.length > 1;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <Avatar className="relative mt-0.5 size-7 shrink-0 overflow-visible">
                <AvatarImage src={item.actor.image ?? undefined} alt="" />
                <AvatarFallback className="text-xs">
                  {getInitials(item.actor.name)}
                </AvatarFallback>
                <RoleBadge
                  role={item.actor.role}
                  isOwner={item.actor.isOwner}
                />
              </Avatar>
              <div className="min-w-0 flex-1 text-sm leading-7">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className="font-medium">{item.actor.name}</span>
                  {!inline && (
                    <ActivitySymbol
                      kind={item.kind}
                      className="size-3.5 text-muted-foreground"
                    />
                  )}
                  <span className="text-muted-foreground">{summary(item)}</span>
                  {inline && <Changes changes={item.changes} inline />}
                  <span aria-hidden className="mx-0.5 text-muted-foreground/40">
                    ·
                  </span>
                  <time
                    dateTime={item.createdAt}
                    title={new Date(item.createdAt).toLocaleString()}
                    className="text-xs text-muted-foreground/70"
                  >
                    {relativeTime(item.createdAt)}
                  </time>
                </div>
                {!inline && showDetails && <Changes changes={item.changes} />}
              </div>
            </li>
          );
        })}
      </ol>
      {isError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          Couldn’t load more activity. Please try again.
        </p>
      )}
      {hasNextPage && (
        <Button
          className="mt-5"
          variant="ghost"
          size="sm"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more activity
        </Button>
      )}
    </div>
  );
}
