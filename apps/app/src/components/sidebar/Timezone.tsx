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
    <div className={cn("px-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-accent">TIME</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="rounded-sm bg-card dark:bg-black/40 px-1.5 py-0.5 border border-border/80 ring-1 ring-border/20 ring-offset-1 ring-offset-white dark:ring-offset-black text-xs font-light text-foreground">{time}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6} align="end">
              <span className="font-bold">Current workspace time</span> in the workspace's timezone. All dates, ranges, and graphs you see are matched to this timezone.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
