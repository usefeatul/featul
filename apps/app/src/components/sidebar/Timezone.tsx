"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { getSlugFromPath } from "../../config/nav";
import { formatTime12h } from "@/lib/time";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@featul/ui/components/tooltip";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceTimezone";

interface TimezoneProps {
  className?: string;
  initialTimezone?: string | null;
  initialServerNow?: number;
}

export default function Timezone({
  className = "",
  initialTimezone,
  initialServerNow
}: TimezoneProps) {
  const pathname = usePathname();
  const slug = getSlugFromPath(pathname || "");

  // Calculate server time drift (memoized since it's based on initial values)
  const drift = React.useMemo(
    () => (initialServerNow ? initialServerNow - Date.now() : 0),
    [initialServerNow]
  );

  // Get timezone from TanStack Query cache
  const { timezone } = useWorkspaceTimezone(slug || "", initialTimezone || undefined);

  // Format and update time display
  const [time, setTime] = React.useState<string>(() =>
    timezone ? formatTime12h(timezone, new Date(Date.now() + drift)) : ""
  );

  React.useEffect(() => {
    if (!timezone) return;

    const updateTime = () => {
      setTime(formatTime12h(timezone, new Date(Date.now() + drift)));
    };

    updateTime(); // Update immediately
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timezone, drift]);

  if (!timezone || !time) return null;

  return (
    <div className={cn(className)}>
      <div className="grid h-9 grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-3">
        <span className="col-start-1 col-end-3 text-[11px] font-medium text-accent/80">TIME</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="rounded-sm border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-accent ring-1 ring-border/20 ring-offset-1 ring-offset-background">
                {time}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={6}
              align="end"
            >
              <span className="font-bold">Current workspace time</span>{" "}
              <span className="text-white/75 dark:text-black/65">
                in the workspace&apos;s timezone. All dates, ranges, and graphs
                you see are matched to this timezone.
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
