"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { ArrowUpDownIcon } from "@featul/ui/icons/arrow-up-down";
import { Button } from "@featul/ui/components/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSlugFromPath } from "@/config/nav";
import { type SortOrder, SORT_OPTIONS } from "@/types/sort";
import {
  buildRoadmapUrl,
  parseRoadmapFiltersFromSearchParams,
} from "@/utils/roadmap/url";

export default function RoadmapSortAction({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);

  const currentOrder = React.useMemo(
    () => parseRoadmapFiltersFromSearchParams(searchParams).order,
    [searchParams],
  );

  const handleOrderChange = React.useCallback(
    (newOrder: SortOrder) => {
      const href = buildRoadmapUrl(slug, searchParams, { order: newOrder });
      React.startTransition(() => router.push(href, { scroll: false }));
      setOpen(false);
    },
    [router, searchParams, slug],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="icon-sm"
          aria-label="Sort"
          className={className}
        >
          <ArrowUpDownIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {SORT_OPTIONS.map(({ value, label }) => (
            <PopoverListItem
              key={value}
              role="menuitemradio"
              aria-checked={currentOrder === value}
              onClick={() => handleOrderChange(value)}
            >
              <span className="text-sm">{label}</span>
              {currentOrder === value ? (
                <span className="ml-auto text-xs">✓</span>
              ) : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
