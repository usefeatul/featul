"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { toolbarItemClass } from "@featul/ui/components/toolbar";
import {
  CheckIcon,
  ChevronDownIcon,
  ListFilterIcon,
} from "@/components/global/icons";

import { cn } from "@featul/ui/lib/utils";
import StatusIcon from "@/components/requests/StatusIcon";
import {
  ROADMAP_STATUSES,
  statusLabel,
  type RoadmapStatus,
} from "@/lib/roadmap";
import { encodeArray, toggleValue } from "@/utils/request";
import { parseRoadmapStatusFilter } from "@/utils/subdomain/status";

export function RoadmapStatusFilter({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    () => parseRoadmapStatusFilter(searchParams.get("status")),
    [searchParams],
  );

  const label =
    selected.length === 0
      ? "All statuses"
      : selected.length === 1
        ? statusLabel(selected[0]!)
        : `${selected.length} statuses`;

  const updateSelection = React.useCallback(
    (next: RoadmapStatus[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (next.length > 0) {
        params.set("status", encodeArray(next));
      } else {
        params.delete("status");
      }

      const query = params.toString();
      React.startTransition(() => {
        router.push(`${pathname}${query ? `?${query}` : ""}`, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const toggle = (status: RoadmapStatus) => {
    updateSelection(toggleValue(selected, status) as RoadmapStatus[]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="plain"
          aria-label="Filter by roadmap status"
          aria-pressed={selected.length > 0}
          title={label}
          className={cn(
            toolbarItemClass,
            "h-8 justify-start gap-2 px-3",
            compact && "w-8 justify-center px-2",
            selected.length > 0 &&
              "bg-primary/10 text-primary dark:bg-primary/15",
            className,
          )}
        >
          <ListFilterIcon className="size-4" size={16} />
          <span className={compact ? "sr-only" : "truncate"}>{label}</span>
          {!compact ? <ChevronDownIcon className="ml-auto size-3" /> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" list className="w-fit min-w-0">
        <PopoverList>
          <PopoverListItem
            role="menuitemradio"
            aria-checked={selected.length === 0}
            onClick={() => {
              updateSelection([]);
              setOpen(false);
            }}
          >
            <ListFilterIcon className="size-4 shrink-0" size={16} />
            <span className="text-sm">All statuses</span>
            {selected.length === 0 ? (
              <CheckIcon className="ml-auto size-3.5" size={14} />
            ) : null}
          </PopoverListItem>
          {ROADMAP_STATUSES.map((status) => {
            const isSelected = selected.includes(status);
            return (
              <PopoverListItem
                key={status}
                role="menuitemcheckbox"
                aria-checked={isSelected}
                onClick={() => toggle(status)}
              >
                <StatusIcon status={status} className="size-4 shrink-0" />
                <span className="text-sm">{statusLabel(status)}</span>
                {isSelected ? (
                  <CheckIcon className="ml-auto size-3.5" size={14} />
                ) : null}
              </PopoverListItem>
            );
          })}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
