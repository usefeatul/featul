"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@featul/ui/components/input";
import { CheckIcon } from "@featul/ui/icons/check";
import { SearchIcon } from "@featul/ui/icons/search";
import { cn } from "@featul/ui/lib/utils";
import { settingsTableShellClass } from "@/components/settings/global/SectionCard";
import { SidebarBadge } from "@/components/sidebar/badge";
import { formatTime12h, formatTimeWithDate } from "@/lib/time";
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

  const timezones = useMemo(
    () => getTimezoneOptions(mounted),
    [mounted],
  );

  const filtered = useMemo(
    () => filterTimezones(timezones, query),
    [query, timezones],
  );

  const localTimezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  return (
    <div
      className={cn(
        settingsTableShellClass,
        "flex min-h-0 flex-col",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border/60 p-3 dark:border-white/10">
        <div className="mb-2 flex w-fit items-center gap-2">
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
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-accent" />
          <Input
            ref={searchRef}
            placeholder="Search by city or country..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 border-border/60 bg-background pl-9 shadow-none focus-visible:ring-1 dark:border-white/10 dark:bg-black/30"
          />
        </div>
      </div>

      <ul
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 [-webkit-overflow-scrolling:touch] touch-pan-y scrollbar-hide"
        role="listbox"
        aria-label="Timezones"
      >
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-accent">
            No timezones match your search.
          </li>
        ) : (
          filtered.map((tz) => {
            const selected = value === tz;
            return (
              <li key={tz} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onChange(tz)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    selected
                      ? "bg-muted/30 text-foreground dark:bg-white/[0.06]"
                      : "text-foreground hover:bg-muted/20 dark:hover:bg-white/[0.03]",
                  )}
                >
                  <span
                    className="shrink-0 font-medium tabular-nums"
                    suppressHydrationWarning
                  >
                    {mounted ? formatTimeWithDate(tz, now) : "--:--"}
                  </span>
                  <span className="min-w-0 truncate text-accent">
                    {friendlyTimezone(tz)}
                  </span>
                  {selected ? (
                    <CheckIcon
                      className="ml-auto size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
