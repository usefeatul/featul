"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@featul/ui/components/input";
import { PopoverListItem } from "@featul/ui/components/popover";
import { CheckIcon } from "@featul/ui/icons/check";
import { SearchIcon } from "@featul/ui/icons/search";
import { cn } from "@featul/ui/lib/utils";
import { SidebarBadge } from "@/components/sidebar/badge";
import { formatTime12h } from "@/lib/time";
import {
  filterTimezones,
  friendlyTimezone,
  getTimezoneOptions,
} from "@/lib/timezone";

type Props = {
  value: string;
  onChange: (timezone: string) => void;
  now: Date;
  autoFocus?: boolean;
  className?: string;
};

export function TimezoneSelectPanel({
  value,
  onChange,
  now,
  autoFocus = false,
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  const timezones = useMemo(() => getTimezoneOptions(mounted), [mounted]);

  const filtered = useMemo(
    () => filterTimezones(timezones, query),
    [query, timezones],
  );

  const localTimezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="shrink-0 space-y-2 border-b border-border/60 px-2 py-2 dark:border-white/10">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-accent">Your local time</span>
          <SidebarBadge
            className="shrink-0"
            fixedWidth={false}
            innerClassName="px-1.5 tabular-nums"
          >
            <span suppressHydrationWarning>
              {mounted ? formatTime12h(localTimezone, now) : "--:--"}
            </span>
          </SidebarBadge>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-accent" />
          <Input
            ref={searchRef}
            placeholder="Search by city or country..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 pl-9 placeholder:text-accent"
          />
        </div>
      </div>

      <ul
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 [-webkit-overflow-scrolling:touch] touch-pan-y scrollbar-hide"
        role="listbox"
        aria-label="Timezones"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-8 text-center text-sm text-accent">
            No timezones match your search.
          </li>
        ) : (
          filtered.map((tz) => {
            const selected = value === tz;
            return (
              <li key={tz} role="option" aria-selected={selected}>
                <PopoverListItem
                  type="button"
                  aria-checked={selected}
                  onClick={() => onChange(tz)}
                  className={cn(
                    "gap-2 px-2.5 py-2 text-xs",
                    selected && "bg-muted/40 dark:bg-muted/30",
                  )}
                >
                  <SidebarBadge
                    className="shrink-0"
                    fixedWidth={false}
                    innerClassName="px-1.5 tabular-nums"
                  >
                    <span suppressHydrationWarning>
                      {mounted ? formatTime12h(tz, now) : "--:--"}
                    </span>
                  </SidebarBadge>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {friendlyTimezone(tz)}
                  </span>
                  {selected ? (
                    <CheckIcon
                      className="ml-auto size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                  ) : null}
                </PopoverListItem>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
