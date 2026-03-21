"use client";

import React from "react";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { Button } from "@featul/ui/components/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFilterPopover } from "@/lib/filter-store";
import { getSlugFromPath, workspaceBase } from "@/config/nav";
import {
  buildRequestsUrl,
  toggleValue,
  isAllSelected as isAllSel,
} from "@/utils/request";
import { parseRequestFiltersFromSearchParams } from "@/utils/request-filters";

type MultiSelectFilterKey = "status" | "board" | "tag";

type RequestFilterItem = {
  id: string;
  label: string;
  value: string;
  meta?: ReactNode;
};

type UseRequestMultiSelectFilterOptions = {
  filterKey: MultiSelectFilterKey;
  popoverKey: string;
  values: string[];
};

type RequestMultiSelectFilterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  ariaLabel: string;
  icon: ReactNode;
  items: RequestFilterItem[];
  selected: string[];
  isAllSelected: boolean;
  onToggle: (value: string) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
  emptyLabel?: string;
};

export function useRequestMultiSelectFilter({
  filterKey,
  popoverKey,
  values,
}: UseRequestMultiSelectFilterOptions) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const [open, setOpen] = useFilterPopover(popoverKey);
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);

  const selected = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp)[filterKey],
    [filterKey, sp],
  );
  const isAllSelected = React.useMemo(
    () => isAllSel(values, selected),
    [selected, values],
  );

  const updateSelection = React.useCallback(
    (next: string[]) => {
      if (next.length === 0) {
        const href = workspaceBase(slug);
        React.startTransition(() => {
          router.replace(href, { scroll: false });
        });
        return;
      }

      const href = buildRequestsUrl(slug, sp, {
        [filterKey]: next,
      } as Partial<{
        status: string[];
        board: string[];
        tag: string[];
      }>);

      React.startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [filterKey, router, slug, sp],
  );

  const toggle = React.useCallback(
    (value: string) => {
      updateSelection(toggleValue(selected, value));
    },
    [selected, updateSelection],
  );

  const selectAll = React.useCallback(() => {
    updateSelection(isAllSelected ? [] : values);
  }, [isAllSelected, updateSelection, values]);

  return {
    open,
    setOpen,
    selected,
    isAllSelected,
    toggle,
    selectAll,
  };
}

export function RequestMultiSelectFilter({
  open,
  onOpenChange,
  className = "",
  ariaLabel,
  icon,
  items,
  selected,
  isAllSelected,
  onToggle,
  onSelectAll,
  isLoading = false,
  emptyLabel,
}: RequestMultiSelectFilterProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="icon-sm"
          aria-label={ariaLabel}
          className={className}
        >
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {isLoading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 && emptyLabel ? (
          <div className="p-3 text-sm text-accent">{emptyLabel}</div>
        ) : (
          <PopoverList>
            {items.map((item) => (
              <PopoverListItem
                key={item.id}
                role="menuitemcheckbox"
                aria-checked={selected.includes(item.value)}
                onClick={() => onToggle(item.value)}
              >
                <span className="truncate text-sm">{item.label}</span>
                {item.meta}
                {selected.includes(item.value) ? (
                  <span
                    className={item.meta ? "ml-1 text-xs" : "ml-auto text-xs"}
                  >
                    ✓
                  </span>
                ) : null}
              </PopoverListItem>
            ))}
            <PopoverListItem
              onClick={onSelectAll}
              role="menuitemcheckbox"
              aria-checked={isAllSelected}
            >
              <span className="text-sm">Select all</span>
              {isAllSelected ? (
                <span className="ml-auto text-xs">✓</span>
              ) : null}
            </PopoverListItem>
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  );
}
